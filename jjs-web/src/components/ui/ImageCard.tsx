import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Card, Image, Text, Box, AspectRatio } from '@mantine/core';
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
  footerSlot?: ReactNode;
}

export default function ImageCard(props: ImageCardProps) {
  const { title, previewText, previewLines = 3, timestamp, imageUrl, alt, link, footerText, footerSlot } = props;

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
               <AspectRatio ratio={16 / 9}>
                  <Image
                    src={imageUrl}
                    alt={alt ?? title}
                    className={classes.image}
                    />
             </AspectRatio>
          </Box>
        </Card.Section>
      )}

      <Box style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: 'var(--mantine-spacing-md)' }}>
        <Text component="h3" fw={600} size="xl" lh="sm" mb="xs">
          {title}
        </Text>

        {timestamp && (
          <Text size="sm" c="dimmed" mb="md">
            {new Date(timestamp).toLocaleDateString()}
          </Text>
        )}

        <Text
          size="sm"
          c="dimmed"
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

        {(footerText || footerSlot) && (
          <Box mt="lg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            {footerText && (
              <Text fw={500} size="sm" className={classes.footerText}>
                {footerText}
              </Text>
            )}
            {footerSlot}
          </Box>
        )}
      </Box>
    </Card>
  );
}
