import { useDrag } from '@use-gesture/react'
import { doUndo, doRedo, indentSelection, outdentSelection } from './editorCommands'

const DISTANCE_THRESHOLD = 40
const VERTICAL_DRIFT_LIMIT = 15

/** Binds swipe gestures over the editor surface. Deliberately conservative:
 * only fires on a clearly horizontal swipe past a distance threshold, and
 * requires two simultaneous touch points for the indent/outdent variants —
 * this keeps normal scrolling and text-selection drags from being hijacked. */
export function useSwipeGestures(viewRef) {
  return useDrag(
    ({ last, movement: [mx, my], touches }) => {
      if (!last) return
      const absX = Math.abs(mx)
      const absY = Math.abs(my)
      if (absX < DISTANCE_THRESHOLD || absY > VERTICAL_DRIFT_LIMIT) return

      const view = viewRef.current
      if (!view) return

      if (touches >= 2) {
        if (mx > 0) indentSelection(view)
        else outdentSelection(view)
      } else {
        if (mx > 0) doRedo(view)
        else doUndo(view)
      }
    },
    {
      pointer: { touch: true },
      filterTaps: true,
    }
  )
}
