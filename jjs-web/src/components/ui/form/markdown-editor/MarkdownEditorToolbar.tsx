import {
  ActionIcon, Divider, Group, Menu, Tooltip,
} from '@mantine/core';
import { IconDots } from '@tabler/icons-react';
import { useMarkdownEditorContext } from './MarkdownEditorContext';
import type { MarkdownTool } from './types';
import classes from './MarkdownEditor.module.css';

export function MarkdownEditorToolbar() {
  const {
    toolbarRef, dotsWrapperRef, visibleTools, overflowTools, hasOverflow,
    disabled, uploading, tab,
  } = useMarkdownEditorContext();

  const renderButton = (tool: MarkdownTool, index: number) => (
    <Tooltip key={index} label={tool.label} withArrow fz="xs" openDelay={400}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onMouseDown={event => { event.preventDefault(); tool.action(); }}
        disabled={disabled || uploading}
        loading={tool.loading}
        aria-label={tool.label}
      >
        {tool.icon}
      </ActionIcon>
    </Tooltip>
  );

  return (
    <Group
      ref={toolbarRef}
      gap={2}
      px="xs"
      py={4}
      wrap="nowrap"
      className={classes.toolbar}
      style={{ display: tab === 'write' ? undefined : 'none' }}
    >
      {visibleTools.map((tool, index) =>
        tool === null
          ? <Divider key={index} orientation="vertical" h={16} mx={2} style={{ alignSelf: 'center' }} />
          : renderButton(tool, index)
      )}
      <div
        ref={dotsWrapperRef}
        style={{ display: 'flex', alignItems: 'center', visibility: hasOverflow ? 'visible' : 'hidden' }}
      >
        <Divider orientation="vertical" h={16} mx={2} style={{ alignSelf: 'center' }} />
        <Menu shadow="md" position="bottom-end" withinPortal>
          <Menu.Target>
            <Tooltip label="More" withArrow fz="xs" openDelay={400}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                disabled={disabled || uploading}
                aria-label="More formatting options"
              >
                <IconDots size={14} />
              </ActionIcon>
            </Tooltip>
          </Menu.Target>
          <Menu.Dropdown>
            {overflowTools.map((tool, index) =>
              tool === null
                ? <Menu.Divider key={index} />
                : <Menu.Item key={index} leftSection={tool.icon} fz="sm" onClick={tool.action}>{tool.label}</Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </div>
    </Group>
  );
}
