import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

type ConfirmOptions = {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

type AlertOptions = {
  title: string
  description: string
  buttonText?: string
}

type DialogContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  alert: (options: AlertOptions) => Promise<void>
}

type ActiveDialog =
  | ({
      type: 'confirm'
      options: ConfirmOptions
      resolve: (value: boolean) => void
    })
  | ({
      type: 'alert'
      options: AlertOptions
      resolve: () => void
    })

const DialogContext = createContext<DialogContextValue | null>(null)

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null)

  const closeDialog = useCallback(() => {
    setActiveDialog(null)
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setActiveDialog({
        type: 'confirm',
        options,
        resolve,
      })
    })
  }, [])

  const alert = useCallback((options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setActiveDialog({
        type: 'alert',
        options,
        resolve,
      })
    })
  }, [])

  const value = useMemo<DialogContextValue>(
    () => ({
      confirm,
      alert,
    }),
    [confirm, alert],
  )

  const handleCancel = () => {
    if (!activeDialog) return
    if (activeDialog.type === 'confirm') {
      activeDialog.resolve(false)
    } else {
      activeDialog.resolve()
    }
    closeDialog()
  }

  const handleConfirm = () => {
    if (!activeDialog) return
    if (activeDialog.type === 'confirm') {
      activeDialog.resolve(true)
    } else {
      activeDialog.resolve()
    }
    closeDialog()
  }

  return (
    <DialogContext.Provider value={value}>
      {children}

      {activeDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    activeDialog.type === 'confirm' && activeDialog.options.destructive
                      ? 'bg-destructive/10'
                      : 'bg-primary/10',
                  ].join(' ')}
                >
                  {activeDialog.type === 'confirm' && activeDialog.options.destructive ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
                <h2 className="font-bold text-lg text-foreground">
                  {activeDialog.options.title}
                </h2>
              </div>

              <button
                onClick={handleCancel}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-muted-foreground">{activeDialog.options.description}</p>
            </div>

            <div className="flex gap-3 p-6 border-t border-border bg-secondary/20">
              {activeDialog.type === 'confirm' && (
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold hover:bg-secondary transition-all"
                >
                  {activeDialog.options.cancelText ?? 'Cancel'}
                </button>
              )}

              <button
                onClick={handleConfirm}
                className={[
                  'px-4 py-2.5 rounded-lg text-white font-semibold transition-all',
                  activeDialog.type === 'confirm'
                    ? `flex-1 ${
                        activeDialog.options.destructive
                          ? 'bg-destructive hover:bg-destructive/90'
                          : 'bg-primary hover:bg-primary/90'
                      }`
                    : 'w-full bg-primary hover:bg-primary/90',
                ].join(' ')}
              >
                {activeDialog.type === 'confirm'
                  ? activeDialog.options.confirmText ?? 'Confirm'
                  : activeDialog.options.buttonText ?? 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

export function useAppDialog() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useAppDialog must be used within AppDialogProvider')
  }
  return context
}
