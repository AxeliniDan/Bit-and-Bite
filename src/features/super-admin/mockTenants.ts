export interface Tenant {
    id: string;
    name: string;
    status: 'active' | 'suspended' | 'trial';
    plan: 'basic' | 'pro' | 'enterprise';
    createdAt: string;
    nextBilling: string;
    revenue: number;
}

export const MOCK_TENANTS: Tenant[] = [
    {
        id: 'c-demo-001',
        name: 'Vet Demo Clinic',
        status: 'active',
        plan: 'pro',
        createdAt: '2024-01-01',
        nextBilling: '2024-02-01',
        revenue: 99.00
    },
    {
        id: 'c-happy-paws',
        name: 'Happy Paws Veterinary',
        status: 'active',
        plan: 'basic',
        createdAt: '2023-11-15',
        nextBilling: '2024-01-15',
        revenue: 49.00
    },
    {
        id: 'c-bad-payer',
        name: 'Clinica Deudora S.A.',
        status: 'suspended',
        plan: 'enterprise',
        createdAt: '2023-08-01',
        nextBilling: '2023-09-01',
        revenue: 299.00
    }
];

// Helper to get tenants from storage or default
export const getTenants = (): Tenant[] => {
    const stored = localStorage.getItem('saas_tenants');
    if (stored) return JSON.parse(stored);

    // Seed and return defaults
    localStorage.setItem('saas_tenants', JSON.stringify(MOCK_TENANTS));
    return MOCK_TENANTS;
}
