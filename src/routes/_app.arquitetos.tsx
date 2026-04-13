import { createFileRoute } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

import {
    ArchitectSheet,
    type Architect
} from '@/components/architects/architect-sheet';
import { columns } from '@/components/architects/columns';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';

export const Route = createFileRoute('/_app/arquitetos')({
    component: RouteComponent
});

const mockArchitects: Architect[] = [
    {
        id: '1',
        name: 'Ana Carolina Mendes',
        email: 'ana.mendes@escritorio.com',
        phone: '(11) 99999-0001',
        office_address: 'Rua das Flores, 123, São Paulo - SP',
        birthdate: '1985-03-15',
        cau_register: 'A123456-0',
        photo_url: undefined,
        linked: true,
        total_points: 1250,
        created_at: '2025-01-10T10:00:00Z',
        updated_at: '2025-03-20T14:00:00Z'
    },
    {
        id: '2',
        name: 'Roberto Figueiredo',
        email: 'roberto.f@arq.com.br',
        phone: '(21) 98888-0002',
        office_address: 'Av. Atlântica, 500, Rio de Janeiro - RJ',
        birthdate: '1978-07-22',
        cau_register: 'B654321-9',
        photo_url: undefined,
        linked: true,
        total_points: 980,
        created_at: '2025-01-15T09:00:00Z',
        updated_at: '2025-04-01T11:00:00Z'
    },
    {
        id: '3',
        name: 'Juliana Costa Braga',
        email: 'ju.braga@studio.arq',
        phone: undefined,
        office_address: undefined,
        birthdate: '1992-11-05',
        cau_register: undefined,
        photo_url: undefined,
        linked: false,
        total_points: 0,
        created_at: '2026-03-01T08:30:00Z',
        updated_at: '2026-03-01T08:30:00Z'
    },
    {
        id: '4',
        name: 'Marcos Vinicius Alves',
        email: 'marcos.alves@malves.arq.br',
        phone: '(31) 97777-0004',
        office_address: 'Rua Sergipe, 890, Belo Horizonte - MG',
        birthdate: '1980-04-18',
        cau_register: 'C112233-1',
        photo_url: undefined,
        linked: true,
        total_points: 2100,
        created_at: '2024-12-05T07:00:00Z',
        updated_at: '2026-02-10T16:00:00Z'
    },
    {
        id: '5',
        name: 'Fernanda Lopes',
        email: 'fernanda@lopes-arq.com',
        phone: '(41) 96666-0005',
        office_address: 'Rua XV de Novembro, 300, Curitiba - PR',
        birthdate: '1990-09-30',
        cau_register: 'D445566-7',
        photo_url: undefined,
        linked: false,
        total_points: 0,
        created_at: '2026-04-01T12:00:00Z',
        updated_at: '2026-04-01T12:00:00Z'
    }
];

function RouteComponent() {
    return (
        <div className="flex flex-1 flex-col gap-6 py-6 min-h-0">
            <div className="flex flex-col gap-2 px-4 lg:px-6">
                <h1 className="font-heading text-3xl font-semibold">
                    Arquitetos
                </h1>

                <p className="text-muted-foreground text-sm">
                    Gerencie os arquitetos parceiros e acompanhe suas
                    pontuações.
                </p>
            </div>

            <DataTable
                columns={columns}
                data={mockArchitects}
                filterColumn="name"
                filterPlaceholder="Buscar arquiteto..."
                toolbar={
                    <ArchitectSheet
                        trigger={
                            <Button size="sm">
                                <PlusIcon />
                                Novo arquiteto
                            </Button>
                        }
                    />
                }
            />
        </div>
    );
}
