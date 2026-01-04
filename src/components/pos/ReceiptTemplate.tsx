import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ReceiptItem {
    name: string
    qty: number
    price: number
}

interface ReceiptData {
    clinicName: string
    address?: string
    phone?: string
    ticketId: string
    date: Date
    items: ReceiptItem[]
    total: number
    customerName?: string
    nextAppointment?: Date
}

export function ReceiptTemplate({ data }: { data: ReceiptData }) {
    return (
        <div className="hidden print:block fixed top-0 left-0 w-full h-full bg-white z-[9999]">
            {/* 58mm Thermal Paper Container */}
            <div className="w-[58mm] p-2 mx-auto font-mono text-[11px] leading-tight text-black">

                {/* HEAD */}
                <div className="text-center mb-4">
                    <h1 className="font-bold text-lg uppercase mb-1">{data.clinicName}</h1>
                    {data.address && <p className="mb-1">{data.address}</p>}
                    {data.phone && <p>Tel: {data.phone}</p>}
                </div>

                {/* META */}
                <div className="border-b border-black border-dashed pb-2 mb-2 flex flex-col gap-0.5">
                    <p>Ticket: #{data.ticketId}</p>
                    <p>Fecha: {format(data.date, "dd/MM/yyyy HH:mm")}</p>
                    {data.customerName && <p>Cliente: {data.customerName}</p>}
                </div>

                {/* ITEMS */}
                <table className="w-full mb-4">
                    <thead>
                        <tr className="text-left border-b border-black">
                            <th className="py-1">Cant/Desc</th>
                            <th className="py-1 text-right">$$</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 border-none">
                        {data.items.map((item, i) => (
                            <tr key={i}>
                                <td className="py-1 pr-1">
                                    <div className="font-bold">{item.qty}x</div>
                                    <div className="truncate w-[35mm]">{item.name}</div>
                                </td>
                                <td className="py-1 text-right valign-top">
                                    ${(item.price * item.qty).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* TOTAL */}
                <div className="border-t-2 border-black border-dashed pt-2 mb-4">
                    <div className="flex justify-between font-bold text-sm">
                        <span>TOTAL</span>
                        <span>${data.total.toFixed(2)}</span>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="text-center space-y-2 pt-2 border-t border-black">
                    {data.nextAppointment && (
                        <div className="border-2 border-black p-1 font-bold">
                            <p className="uppercase text-[10px]">Próxima Cita:</p>
                            <p>{format(data.nextAppointment, "dd MMM HH:mm", { locale: es })}</p>
                        </div>
                    )}

                    <p className="uppercase font-bold mt-4">**** Gracias por su visita ****</p>
                    <p className="text-[9px]">Sistema: Bit&Bite SaaS</p>
                </div>
            </div>

            {/* Print Reset Styles */}
            <style>
                {`
                    @media print {
                        @page { size: 58mm auto; margin: 0; }
                        body * { visibility: hidden; }
                        .print\\:block, .print\\:block * { visibility: visible; }
                        .print\\:block { position: absolute; left: 0; top: 0; width: 58mm; }
                    }
                `}
            </style>
        </div>
    )
}
