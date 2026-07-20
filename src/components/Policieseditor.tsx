interface Policies {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    coupleFriendly: boolean;
    cancellationPolicy: string;
}

interface PoliciesEditorProps {
    label: string;
    value: Policies;
    onChange: (policies: Policies) => void;
}

const TOGGLE_POLICIES: {
    key: keyof Omit<Policies, "cancellationPolicy">;
    label: string;
    desc: string;
}[] = [
        { key: "smokingAllowed", label: "Smoking Allowed", desc: "Guests may smoke on premises" },
        { key: "petsAllowed", label: "Pets Allowed", desc: "Guests may bring pets" },
        { key: "coupleFriendly", label: "Couple Friendly", desc: "Unmarried couples accepted" },
    ];

const CANCELLATION_OPTIONS = [
    "Free cancellation before 24 hours",
    "Free cancellation before 48 hours",
    "Free cancellation before 7 days",
    "Non-refundable",
];

export default function PoliciesEditor({ label, value, onChange }: PoliciesEditorProps) {
    const toggle = (key: keyof Omit<Policies, "cancellationPolicy">) => {
        onChange({ ...value, [key]: !value[key] });
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-slate-700">{label}</label>

            <div className="rounded-sm border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
                {TOGGLE_POLICIES.map(({ key, label: pLabel, desc }) => (
                    <div key={key} className="flex items-center justify-between px-4 py-3">
                        <div>
                            <p className="text-sm font-medium text-slate-700">{pLabel}</p>
                            <p className="text-xs text-slate-400">{desc}</p>
                        </div>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={value[key]}
                            onClick={() => toggle(key)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${value[key] ? "bg-slate-800" : "bg-slate-200"
                                }`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${value[key] ? "translate-x-4" : "translate-x-0"
                                    }`}
                            />
                        </button>
                    </div>
                ))}

                <div className="px-4 py-3 flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">Cancellation Policy</label>
                    <select
                        value={value.cancellationPolicy}
                        onChange={(e) => onChange({ ...value, cancellationPolicy: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    >
                        {CANCELLATION_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}