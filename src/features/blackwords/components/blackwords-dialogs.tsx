import { BlackwordsCreateDrawer } from './drawers/blackwords-create-drawer'
import { BlackwordsUpdateDrawer } from './drawers/blackwords-update-drawer'
import { BlackwordsInfoDialog } from './dialogs/blackwords-info-dialog'
import { BlackwordsDeleteDialog } from './dialogs/blackwords-delete-dialog'

export function BlackwordsDialogs() {
  return (
    <>
      <BlackwordsCreateDrawer />
      <BlackwordsUpdateDrawer />
      <BlackwordsInfoDialog />
      <BlackwordsDeleteDialog />
    </>
  )
}
