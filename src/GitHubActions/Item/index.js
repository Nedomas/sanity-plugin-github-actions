import React, { useState, useEffect } from 'react'
import sanityClient from 'part:@sanity/base/client'
import { onTrigger } from './lib/onTrigger'
import { onRemove } from './lib/onRemove'

import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  Inline,
  Stack,
  Text,
  Badge,
  useToast,
} from '@sanity/ui'

export const Item = ({
  action,
}) => {
  const toast = useToast()
  const [isTriggering, setIsTriggering] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const client = sanityClient.withConfig({ apiVersion: '2022-04-21' })

  return (
    <Flex align="center">
      <Box flex={1} paddingBottom={1}>
        <Stack space={2}>
          <Inline space={2}>
            <Heading as="h2" size={1}>
              <Text weight="semibold">{action.name}</Text>
            </Heading>
            <Badge
              tone="primary"
              paddingX={3}
              paddingY={2}
              radius={6}
              fontSize={0}
            >
              {action.organization} / {action.repository}
            </Badge>
            <Code size={1}>
              <Box
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {action.eventType}
              </Box>
            </Code>
          </Inline>
        </Stack>
      </Box>

      <Box marginRight={1}>
        <Button
          type="button"
          tone="positive"
          disabled={isTriggering}
          loading={isTriggering}
          onClick={onTrigger({ isTriggering, setIsTriggering, action, toast })}
          radius={3}
          text={isTriggering ? "Triggering..." : "Trigger"}
        />
      </Box>

      <Box marginRight={1}>
        <a href={`https://github.com/${action.organization}/${action.repository}/actions`} target='_blank' rel='noreferrer'>
          <Button
            type="button"
            radius={3}
            text='Status'
          />
        </a>
      </Box>

      <Button
        type="button"
        tone="negative"
        disabled={isRemoving}
        loading={isRemoving}
        onClick={onRemove({ isRemoving, setIsRemoving, action, client })}
        radius={3}
        text={isRemoving ? "Removing..." : "Remove"}
      />
    </Flex>
  )
}
