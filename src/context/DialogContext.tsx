import { createContext, useContext, useState, ReactNode } from 'react';
import { Modal, Button, Toast } from '../components/UIComponents';

type DialogContextType = {
    showAlert: (message: string, title?: string) => Promise<void>;
    showConfirm: (message: string, title?: string) => Promise<boolean>;
    showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
    const ctx = useContext(DialogContext);
    if (!ctx) throw new Error("useDialog must be used within DialogProvider");
    return ctx;
}

export function DialogProvider({ children }: { children: ReactNode }) {
    const [dialogs, setDialogs] = useState<any[]>([]);
    const [toasts, setToasts] = useState<{ id: string, type: 'success' | 'error' | 'info' | 'warning', message: string }[]>([]);

    const addDialog = (dialog: any) => setDialogs((prev) => [...prev, dialog]);
    const removeDialog = (id: string) => setDialogs((prev) => prev.filter(d => d.id !== id));

    const showAlert = (message: string, title = "Notification") => {
        return new Promise<void>((resolve) => {
            const id = Math.random().toString();
            addDialog({
                id, type: 'alert', title, message,
                onConfirm: () => { removeDialog(id); resolve(); }
            });
        });
    };

    const showConfirm = (message: string, title = "Confirm Action") => {
        return new Promise<boolean>((resolve) => {
            const id = Math.random().toString();
            addDialog({
                id, type: 'confirm', title, message,
                onConfirm: () => { removeDialog(id); resolve(true); },
                onCancel: () => { removeDialog(id); resolve(false); }
            });
        });
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        const id = Math.random().toString();
        // Replace current toasts to prevent overlap, simplest solution for overlapping
        setToasts([{ id, type, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter(t => t.id !== id));
        }, 3000);
    };

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm, showToast }}>
            {children}
            {dialogs.map((d) => (
                <Modal key={d.id} open={true} onClose={d.onCancel || d.onConfirm} title={d.title} size="sm">
                    <div className="space-y-4">
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{d.message}</p>
                        <div className="flex justify-end gap-2 pt-2">
                            {d.type === 'confirm' && (
                                <Button variant="outline" onClick={d.onCancel}>Cancel</Button>
                            )}
                            <Button onClick={d.onConfirm} variant={d.type === 'confirm' && d.message.includes('PERMANENT') ? 'danger' : 'primary'}>
                                {d.type === 'confirm' ? 'Confirm' : 'OK'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            ))}
            {toasts.map(t => (
                <Toast key={t.id} type={t.type} message={t.message} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
            ))}
        </DialogContext.Provider>
    );
}
