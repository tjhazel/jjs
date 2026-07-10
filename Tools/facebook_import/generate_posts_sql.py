#!/usr/bin/env python3
"""
One-time migration: turn a Facebook "Download Your Information" JSON export into
T-SQL scripts that insert rows into jjs's Posts / PostCategories tables, and copy
the referenced photos into JJS.Api/Albums/PostImages/ so they're served by the
site's PostImageController (/api/post-image/{fileName}) -- matching the URL
convention the post editor's own image upload already uses.

Does NOT embed image bytes in SQL (that's what made the DB too large in the
first attempt). Images are plain files on disk; only a markdown link goes in Body.

Usage:
    python generate_posts_sql.py --export "C:\path\to\your_facebook_activity" \
        --user-email you@example.com --category-id 8 \
        --output-dir out --albums-root "C:\path\to\jjs\JJS.Api\Albums"

Posts with no caption text are skipped entirely, even if they have photos/videos
attached -- image/video-only posts are not imported.
"""
import argparse
import datetime
import hashlib
import json
import os
import shutil
import sys

PHOTO_EXTS = {".jpg", ".jpeg", ".png", ".gif"}
VIDEO_EXTS = {".mp4", ".mov"}

MAX_TITLE = 255
MAX_PREVIEW = 500


def fix_mojibake(s):
    """Facebook's JSON export mis-encodes UTF-8 text as Latin-1-escaped codepoints."""
    if not s:
        return s
    try:
        return s.encode("latin-1").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s


def sql_str(s):
    """N'...' literal with single-quote escaping."""
    if s is None:
        s = ""
    return "N'" + s.replace("'", "''") + "'"


def truncate_utf16(s, max_units):
    """Truncate to a max NVARCHAR length measured in UTF-16 code units, not Python
    codepoints -- a character outside the BMP (e.g. most emoji) is 1 Python char but
    2 UTF-16 units, so a naive s[:n] slice can silently exceed the column's real limit."""
    total = 0
    out = []
    for c in s:
        unit_len = 2 if ord(c) > 0xFFFF else 1
        if total + unit_len > max_units:
            break
        out.append(c)
        total += unit_len
    return "".join(out)


def load_posts(posts_json_path):
    with open(posts_json_path, "rb") as f:
        return json.load(f)


def extract_post_text(post):
    parts = []
    for d in post.get("data", []):
        if "post" in d and d["post"]:
            parts.append(fix_mojibake(d["post"]))
    return "\n\n".join(parts).strip()


def extract_media(post, export_root):
    photos, videos = [], []
    for a in post.get("attachments", []):
        for d in a.get("data", []):
            media = d.get("media")
            if not media:
                continue
            uri = media.get("uri", "")
            ext = os.path.splitext(uri)[1].lower()
            full_path = os.path.join(export_root, uri.replace("/", os.sep))
            if ext in PHOTO_EXTS:
                photos.append({"uri": uri, "ext": ext, "full_path": full_path})
            elif ext in VIDEO_EXTS:
                videos.append({"uri": uri, "ext": ext, "full_path": full_path})
    return photos, videos


def make_title(text, dt):
    # Callers only reach here once a post is confirmed to have text (see build_post_sql).
    first_line = text.replace("\r", " ").replace("\n", " ").strip()
    for stop in [". ", "! ", "? "]:
        idx = first_line.find(stop)
        if 0 < idx < 100:
            return first_line[: idx + 1].strip()
    truncated = truncate_utf16(first_line, MAX_TITLE)
    if truncated == first_line:
        return first_line
    return truncate_utf16(first_line, MAX_TITLE - 3).rstrip() + "..."


def make_preview(text):
    return truncate_utf16(text, MAX_PREVIEW)


def file_md5(path):
    h = hashlib.md5()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def copy_post_image(photo, post_images_dir, copied_hashes, collision_log):
    """Copy a photo into Albums/PostImages/ using its original filename. Returns the
    filename on success, or None if the source file is missing. If a filename is
    already present with DIFFERENT content than what we're about to copy, this is a
    real collision -- we do not silently overwrite; we log it and skip the copy
    (the post will still link to the original file already there)."""
    if not os.path.isfile(photo["full_path"]):
        return None

    filename = os.path.basename(photo["uri"])
    dest_path = os.path.join(post_images_dir, filename)

    if filename in copied_hashes:
        return filename  # already copied this run; identical-by-construction (same source uri)

    if os.path.exists(dest_path):
        existing_hash = file_md5(dest_path)
        new_hash = file_md5(photo["full_path"])
        if existing_hash != new_hash:
            collision_log.append(filename)
            return filename  # leave the pre-existing file alone; still link to it
        copied_hashes.add(filename)
        return filename

    shutil.copy2(photo["full_path"], dest_path)
    copied_hashes.add(filename)
    return filename


def build_post_sql(index, post, export_root, user_email, category_id, post_images_dir, copied_hashes, collision_log, missing_log):
    text = extract_post_text(post)
    photos, videos = extract_media(post, export_root)

    if not text:
        return None, "no-text (image/video-only post, or bare link share)"

    dt = datetime.datetime.utcfromtimestamp(post["timestamp"])
    release_date = dt.strftime("%Y-%m-%d %H:%M:%S")

    title = make_title(text, dt)
    preview = make_preview(text)

    image_links = []
    for photo in photos:
        filename = copy_post_image(photo, post_images_dir, copied_hashes, collision_log)
        if filename is None:
            missing_log.append(photo["uri"])
            continue
        image_links.append(f"![{filename}](/api/post-image/{filename})")

    body_parts = [text] + image_links
    if videos:
        body_parts.append(f"*({len(videos)} video(s) from this post not yet imported)*")
    body = "\n\n".join(body_parts)

    lines = []
    lines.append(f"-- Post #{index}  |  {release_date} UTC  |  {len(image_links)} photo(s) linked, {len(videos)} video(s) skipped")
    lines.append("DECLARE @NewPostIdTbl TABLE (PostId INT);")
    lines.append("DECLARE @NewPostId INT;")
    lines.append("INSERT INTO Posts (Title, PreviewText, Body, ReleaseDate, ExpireDate, CommentsEnabled, Approved, ViewCount, CreatedDate, CreatedByFk, ModifiedDate, ModifiedByFk)")
    lines.append("OUTPUT INSERTED.PostId INTO @NewPostIdTbl")
    lines.append("SELECT")
    # LEFT(...) is a hard safety net enforced by SQL Server itself at insert time, on
    # top of the Python-side truncate_utf16 truncation above. Belt-and-suspenders: if
    # anything between generation and execution re-inflates a literal by a character or
    # two (e.g. a text editor normalizing line endings to CRLF on save), the column still
    # can't overflow -- SQL Server just cuts it instead of erroring.
    lines.append(f"   LEFT({sql_str(title)}, {MAX_TITLE}),")
    lines.append(f"   LEFT({sql_str(preview)}, {MAX_PREVIEW}),")
    lines.append(f"   {sql_str(body)},")
    lines.append(f"   '{release_date}', NULL, 1, 0, 0, '{release_date}', u.Id, '{release_date}', u.Id")
    lines.append(f"FROM Users u WHERE u.Email = {sql_str(user_email)};")
    lines.append("SELECT @NewPostId = PostId FROM @NewPostIdTbl;")
    lines.append("IF @NewPostId IS NOT NULL")
    lines.append("BEGIN")
    lines.append(f"   INSERT INTO PostCategories (PostFk, CategoryFk) VALUES (@NewPostId, {category_id});")
    lines.append("END")
    lines.append("GO")
    lines.append("")

    return "\n".join(lines), None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--export", required=True, help="Path to the unzipped Facebook export root (contains posts/)")
    ap.add_argument("--user-email", required=True)
    ap.add_argument("--category-id", type=int, default=8)
    ap.add_argument("--output-dir", required=True)
    ap.add_argument("--albums-root", required=True, help="Path to JJS.Api/Albums -- PostImages/ subfolder will be created under it")
    ap.add_argument("--limit", type=int, default=0, help="Only process the first N posts (chronologically) -- for a quick sample run")
    args = ap.parse_args()

    posts_json = os.path.join(args.export, "posts", "your_posts__check_ins__photos_and_videos_1.json")
    if not os.path.isfile(posts_json):
        print(f"Could not find {posts_json}", file=sys.stderr)
        sys.exit(1)

    export_parent = os.path.dirname(args.export)  # uri values start with the export folder's own name
    os.makedirs(args.output_dir, exist_ok=True)
    post_images_dir = os.path.join(args.albums_root, "PostImages")
    os.makedirs(post_images_dir, exist_ok=True)

    posts = load_posts(posts_json)
    posts.sort(key=lambda p: p["timestamp"])
    if args.limit:
        posts = posts[: args.limit]

    files_by_year = {}
    skipped_no_content = 0
    missing_log = []
    collision_log = []
    copied_hashes = set()
    imported = 0

    for idx, post in enumerate(posts, start=1):
        sql, skip_reason = build_post_sql(
            idx, post, export_parent, args.user_email, args.category_id,
            post_images_dir, copied_hashes, collision_log, missing_log,
        )
        if sql is None:
            skipped_no_content += 1
            continue
        year = datetime.datetime.utcfromtimestamp(post["timestamp"]).year
        files_by_year.setdefault(year, []).append(sql)
        imported += 1

    header = (
        "-- Auto-generated by Tools/facebook_import/generate_posts_sql.py -- DO NOT hand-edit, regenerate instead.\n"
        "-- Review before running. Each post is its own batch (GO) so a failure doesn't roll back everything before it.\n"
        "-- Images are plain files in Albums/PostImages/, served via /api/post-image/{fileName}. Nothing binary in this script.\n\n"
    )

    total_bytes = 0
    for year, blocks in sorted(files_by_year.items()):
        out_path = os.path.join(args.output_dir, f"facebook_posts_{year}.sql")
        content = header + "\n".join(blocks)
        # newline="" disables Python's universal-newline translation, which on Windows
        # would otherwise silently turn every embedded \n inside a string literal (e.g. a
        # paragraph break in a post's Body) into \r\n -- inflating NVARCHAR values by one
        # character per embedded newline and causing spurious truncation errors.
        with open(out_path, "w", encoding="utf-8", newline="") as f:
            f.write(content)
        size = os.path.getsize(out_path)
        total_bytes += size
        print(f"{out_path}  ({len(blocks)} posts, {size/1024:.1f} KB)")

    print()
    print(f"Imported (written to SQL): {imported}")
    print(f"Skipped, no text:          {skipped_no_content}")
    print(f"Photos copied into {post_images_dir}: {len(copied_hashes)}")
    print(f"Photo files referenced but missing on disk: {len(missing_log)}")
    print(f"Filename collisions with DIFFERENT content (not overwritten, needs manual review): {len(collision_log)}")
    if collision_log:
        for c in collision_log:
            print(f"  COLLISION: {c}")
    print(f"Total generated SQL size: {total_bytes/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
