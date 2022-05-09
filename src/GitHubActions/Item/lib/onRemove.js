export const onRemove = ({
  isRemoving,
  setIsRemoving,
  action,
  client,
}) => async () => {
  if (isRemoving) return
  setIsRemoving(true)

  await client.delete(action._id)

  setIsRemoving(false)
}
