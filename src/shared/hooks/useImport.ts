import { useCallback, useState } from 'react';
import { type ImportResult as DecksImportResult, importDecks } from '../../data/savedDecks';
import { useI18n } from '../i18n/useI18n';
import type { Translations } from '../i18n/translations';

interface ImportResult {
    success: boolean;
    message: string;
}

function describeImport(result: DecksImportResult, t: Translations): string {
    if (result.success) return t.importExport.imported(result.importedCount, result.skippedCount);
    if (result.error === 'invalid-format') return t.importExport.invalidFormat;
    if (result.error === 'no-valid-decks') return t.importExport.noValidDecks;
    return t.importExport.parseFailed;
}

export function useImport() {
    const { t } = useI18n();
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [importMessage, setImportMessage] = useState<string>('');
    const [importSuccess, setImportSuccess] = useState<boolean>(false);

    const handleImport = useCallback((file: File): Promise<ImportResult> => {
        return new Promise((resolve) => {
            setIsImporting(true);
            setImportMessage('');
            setImportSuccess(false);

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const result = importDecks(content);
                    const message = describeImport(result, t);

                    setImportSuccess(result.success);
                    setImportMessage(message);
                    setIsImporting(false);

                    resolve({
                        success: result.success,
                        message
                    });
                } catch (error) {
                    const errorMessage = t.importExport.importFailed(error instanceof Error ? error.message : t.importExport.unknownError);
                    setImportSuccess(false);
                    setImportMessage(errorMessage);
                    setIsImporting(false);

                    resolve({
                        success: false,
                        message: errorMessage
                    });
                }
            };

            reader.onerror = () => {
                const errorMessage = t.importExport.readFailed;
                setImportSuccess(false);
                setImportMessage(errorMessage);
                setIsImporting(false);

                resolve({
                    success: false,
                    message: errorMessage
                });
            };

            reader.readAsText(file);
        });
    }, [t]);

    const clearImportMessage = useCallback(() => {
        setImportMessage('');
        setImportSuccess(false);
    }, []);

    const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
        if (!file) {
            return { isValid: false, error: t.importExport.noFile };
        }

        if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
            return { isValid: false, error: t.importExport.notJson };
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            return { isValid: false, error: t.importExport.tooLarge };
        }

        return { isValid: true };
    }, [t]);

    return {
        // State
        isImporting,
        importMessage,
        importSuccess,

        // Actions
        handleImport,
        clearImportMessage,
        validateFile,

        // Computed values
        hasImportMessage: importMessage.length > 0,
    };
} 