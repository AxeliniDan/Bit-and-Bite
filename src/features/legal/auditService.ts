import { supabase } from "@/lib/supabase"

export const auditService = {
    /**
     * Logs a critical action.
     * Should be called by other services when sensitive data changes.
     */
    logAction: async (userId: string, action: 'CREATE' | 'UPDATE' | 'DELETE', table: string, recordId: string, diff?: unknown) => {
        /*
          In a real-world scenario, we might want to fire and forget this 
          so it doesn't block the main thread, or use a DB trigger.
          For this implementation, we await it to ensure compliance.
        */
        const { error } = await supabase
            .from('audit_logs')
            .insert({
                user_id: userId,
                action,
                table_name: table,
                record_id: recordId,
                changes: diff,
                // ip_address would be captured from headers in a real backend Context
            })

        if (error) console.error("AUDIT LOG FAILURE:", error)
    },

    generateConsent: async (templateId: string) => {
        // Fetch template content
        const { data: template } = await supabase
            .from('consent_templates')
            .select('content_html')
            .eq('id', templateId)
            .single()

        if (!template) throw new Error("Template not found")

        // In a real app, here we would merge {{patient_name}} placeholders
        return template.content_html
    }
}
