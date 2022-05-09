import axios from 'axios'

export const onTrigger = ({
  isTriggering,
  setIsTriggering,
  action,
  toast,
}) => async () => {
  if (isTriggering) return
  setIsTriggering(true)

  const response = await axios({
    method: 'post',
    url: `https://api.github.com/repos/${action.organization}/${action.repository}/dispatches`,
    data: {
      event_type: action.eventType,
    },
    headers: {
      Authorization: `token ${action.token}`,
    },
  })

  toast.push({
    status: 'success',
    title: 'Success!',
    description: `Triggered GitHub Action: ${action.name}`
  })

  setIsTriggering(false)
}
