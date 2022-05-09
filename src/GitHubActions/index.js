import React, { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import axios from 'axios'
import sanityClient from 'part:@sanity/base/client'
import { FormField } from '@sanity/base/components'

import {
  studioTheme,
  ThemeProvider,
  ToastProvider,
  useToast,
  Container,
  Dialog,
  Grid,
  Flex,
  Box,
  Card,
  Stack,
  Spinner,
  Button,
  Text,
  Inline,
  Heading,
  TextInput
} from '@sanity/ui'
import { WarningOutlineIcon } from '@sanity/icons'
import { Item } from './Item'

const initialNewAction = {
  name: '',
  eventType: '',
  organization: '',
  repository: '',
  token: '',
}

export const GitHubActions = () => {
  const TYPE = 'github_action'
  const QUERY = `*[_type == "${TYPE}"] | order(_createdAt)`
  const client = sanityClient.withConfig({ apiVersion: '2022-04-21' })

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [actions, setActions] = useState([])
  const [newAction, setNewAction] = useState(initialNewAction)
  const toast = useToast()

  const onSubmit = async () => {
    setIsSubmitting(true)

    client
      .create({
        // Explicitly define an _id inside to make sure it's not publicly accessible
        // This will protect users' tokens & project info. Read more: https://www.sanity.io/docs/ids
        _id: `github-action.${nanoid()}`,
        _type: TYPE,
        ...newAction,
      })
      .then(() => {
        toast.push({
          status: 'success',
          title: 'Success!',
          description: `Created GitHub Action: ${newAction.title}`
        })
        setIsFormOpen(false)
        setIsSubmitting(false)
        setNewAction(initialNewAction)
      })
  }

  // Fetch all existing webhooks and listen for newly created
  useEffect(() => {
    let webhookSubscription

    client.fetch(QUERY).then(a => {
      setActions(a)
      setIsLoading(false)

      webhookSubscription = client
        .listen(QUERY, {}, { includeResult: true })
        .subscribe(res => {
          const wasCreated = res.mutations.some(item =>
            Object.prototype.hasOwnProperty.call(item, 'create')
          )
          const wasDeleted = res.mutations.some(item =>
            Object.prototype.hasOwnProperty.call(item, 'delete')
          )
          if (wasCreated) {
            setActions(prevState => {
              return [...prevState, res.result]
            })
          }
          if (wasDeleted) {
            setActions(prevState =>
              prevState.filter(w => w._id !== res.documentId)
            )
          }
        })
    })

    return () => {
      webhookSubscription && webhookSubscription.unsubscribe()
    }
  }, [])

  return (
    <ThemeProvider theme={studioTheme}>
      <ToastProvider>
        <Container display="grid" width={6} style={{ minHeight: '100%' }}>
          <Flex direction="column">
            <Card padding={4} borderBottom>
              <Flex align="center">
                <Flex flex={1} align="center">
                  <Card>
                    <Text as="h1" size={2} weight="semibold">
                      GitHub Actions
                    </Text>
                  </Card>
                </Flex>
                <Box>
                  <Button
                    type="button"
                    fontSize={2}
                    tone="primary"
                    padding={3}
                    radius={3}
                    text="Add GitHub Action"
                    onClick={() => setIsFormOpen(true)}
                  />
                </Box>
              </Flex>
            </Card>

            <Card flex={1}>
              <Stack as={'ul'}>
                {isLoading && (
                  <Card as={'li'} padding={4}>
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      paddingTop={3}
                    >
                      <Spinner size={4} />
                      <Box padding={4}>
                        <Text size={2}>Loading your GitHub Actions...</Text>
                      </Box>
                    </Flex>
                  </Card>
                )}
                {actions.map(action => (
                  <Card key={action._id} as={'li'} padding={4} borderBottom>
                    <Item
                      key={action._id}
                      action={action}
                    />
                  </Card>
                ))}
                {!actions.length && !isLoading && (
                  <Card as={'li'} padding={5} paddingTop={6}>
                    <Flex direction="column" align="center" justify="center">
                      <Flex direction="column" align="center" padding={4}>
                        <Text size={2}>No GitHub Actions yet.</Text>
                        <Box padding={4}>
                          <Button
                            fontSize={3}
                            paddingX={5}
                            paddingY={4}
                            tone="primary"
                            radius={4}
                            text="Add GitHub Action"
                            onClick={() => setIsFormOpen(true)}
                          />
                        </Box>
                      </Flex>
                    </Flex>
                  </Card>
                )}
              </Stack>
            </Card>
          </Flex>
        </Container>

        {isFormOpen && (
          <Dialog
            header="New GitHub Action"
            id="create-github-action"
            width={1}
            onClickOutside={() => setIsFormOpen(false)}
            onClose={() => setIsFormOpen(false)}
            footer={
              <Box padding={3}>
                <Grid columns={2} gap={3}>
                  <Button
                    padding={4}
                    mode="ghost"
                    text="Cancel"
                    onClick={() => setIsFormOpen(false)}
                  />
                  <Button
                    padding={4}
                    text="Create"
                    tone="primary"
                    loading={isSubmitting}
                    onClick={() => onSubmit()}
                    disabled={
                      isSubmitting ||
                      !newAction.name ||
                      !newAction.eventType ||
                      !newAction.organization ||
                      !newAction.repository ||
                      !newAction.token
                    }
                  />
                </Grid>
              </Box>
            }
          >
            <Box padding={4}>
              <Stack space={4}>
                <FormField
                  title="Name"
                  description="GitHub Action name"
                >
                  <TextInput
                    type="text"
                    value={newAction.name}
                    onChange={e => {
                      e.persist()
                      setNewAction(prevState => ({
                        ...prevState,
                        ...{ name: e?.target?.value }
                      }))
                    }}
                  />
                </FormField>

                <FormField
                  title="GitHub Action event type"
                  description="The exact event type for the GitHub Action"
                >
                  <TextInput
                    type="text"
                    value={newAction.eventType}
                    onChange={e => {
                      e.persist()
                      setNewAction(prevState => ({
                        ...prevState,
                        ...{ eventType: e?.target?.value }
                      }))
                    }}
                  />
                </FormField>

                <FormField
                  title="GitHub organization"
                  description="The exact organization slug for the GitHub Action"
                >
                  <TextInput
                    type="text"
                    value={newAction.organization}
                    onChange={e => {
                      e.persist()
                      setNewAction(prevState => ({
                        ...prevState,
                        ...{ organization: e?.target?.value }
                      }))
                    }}
                  />
                </FormField>

                <FormField
                  title="GitHub repository"
                  description="The exact repository slug for the GitHub Action"
                >
                  <TextInput
                    type="text"
                    value={newAction.repository}
                    onChange={e => {
                      e.persist()
                      setNewAction(prevState => ({
                        ...prevState,
                        ...{ repository: e?.target?.value }
                      }))
                    }}
                  />
                </FormField>

                <FormField
                  title="GitHub Token"
                  description="A GitHub personal access token from your account settings"
                >
                  <TextInput
                    type="text"
                    value={newAction.token}
                    onChange={e => {
                      e.persist()
                      setNewAction(prevState => ({
                        ...prevState,
                        ...{ token: e?.target?.value }
                      }))
                    }}
                  />
                </FormField>

                <Card
                  padding={4}
                  paddingBottom={5}
                  radius={3}
                  shadow={1}
                  tone="caution"
                >
                  <Box marginBottom={2} style={{ textAlign: 'center' }}>
                    <Inline space={1}>
                      <WarningOutlineIcon style={{ fontSize: 24 }} />
                      <Heading size={1}>Careful!</Heading>
                    </Inline>
                  </Box>
                  <Text size={1} align="center">
                    Once you create this GitHub Action you will not be able to edit
                    it.
                  </Text>
                </Card>
              </Stack>
            </Box>
          </Dialog>
        )}
      </ToastProvider>
    </ThemeProvider>
  )
}
