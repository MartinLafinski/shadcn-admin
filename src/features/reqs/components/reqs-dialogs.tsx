import { useReqs } from './reqs-provider'
import { JobsViewDialog } from '@/features/jobs/components/dialogs/jobs-view-dialog'
import { ReqsViewDialog } from './dialogs/reqs-view-dialog'


export function ReqsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, currentJob, setCurrentJob } = useReqs()

  return (
    <>
      {currentRow && (
        <ReqsViewDialog
          key='req-view-info'
          open={open === 'view'}
          req={currentRow}
          onOpenChange={() => {
            setOpen(null)
            setCurrentRow(null)
          }}
        />
      )}

      {currentJob && (
        <JobsViewDialog
          key='job-view-info'
          open={open === 'viewJob'}
          job={currentJob}
          onOpenChange={() => {
            setOpen(null)
            setCurrentJob(null)
          }}
        />
      )}

    </>
  )
}