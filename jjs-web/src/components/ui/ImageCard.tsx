import { Link } from 'react-router';
import { Card, Image, Text, Box } from '@mantine/core';
import classes from './ImageCard.module.css';

interface ImageCardProps {
  title: string;
  previewText?: string;
  previewLines?: number;
  timestamp?: Date;
  imageUrl?: string;
  alt?: string;
  link: string;
  footerText?: string;
}

export default function ImageCard(props: ImageCardProps) {
  const { title, previewText, previewLines = 3, timestamp, imageUrl, alt, link, footerText } = props;

  return (
    <Card
      component={Link}
      to={link}
      padding="xl"
      radius="none"
      withBorder
      className={classes.card}
      styles={{
        root: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          textDecoration: 'none',
          color: 'inherit',
          transition: 'border-color 150ms ease',
        },
      }}
    >
      {imageUrl && (
        <Card.Section style={{ overflow: 'hidden' }}>
          <Box className={classes.imageWrapper}>
            <Image
              src={imageUrl}
              alt={alt ?? title}
              aspectRatio={16 / 9}
              className={classes.image}
            />
          </Box>
        </Card.Section>
      )}

      <Box style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: 'var(--mantine-spacing-md)' }}>
        <Text component="h3" fw={600} size="xl" lh="sm" c="dark.9" mb="xs">
          {title}
        </Text>

        {timestamp && (
          <Text size="sm" c="dimmed" mb="md">
            {new Date(timestamp).toLocaleDateString()}
          </Text>
        )}

        <Text
          size="sm"
          c="gray.7"
          style={{
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: previewLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {previewText}
        </Text>

        {footerText && (
          <Text fw={500} size="sm" c="dark.9" mt="lg" className={classes.footerText}>
            {footerText}
          </Text>
        )}
      </Box>
    </Card>
  );
}
