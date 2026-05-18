export function EntityIdCell({ value }: { value: number | string }) {
  return <code className='text-xs text-muted-foreground'>{value}</code>
}
