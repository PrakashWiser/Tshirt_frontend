import { useMemo } from "react";
import {
    Star,
    ThumbsUp,
    MessageSquare,
    Calendar,
    CheckCircle,
    Clock,
    Flag,
    MoreHorizontal,
    Download,
    AlertTriangle,
    ThumbsDown,
} from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from "recharts";

interface Stat {
    title: string;
    value: string;
    icon: React.ElementType;
    color: string;
    subtitle: string;
}

interface SentimentData {
    name: string;
    value: number;
    color: string;
}

interface RatingDistribution {
    stars: number;
    percentage: number;
    color: string;
}

interface RecentReview {
    id: string;
    name: string;
    property: string;
    rating: number;
    comment: string;
    sentiment: "positive" | "negative" | "neutral";
    flagged: boolean;
    reported: boolean;
    date: string;
}

interface ModerationQueue {
    flagged: number;
    pendingResponse: number;
    thisWeek: number;
    responded: number;
}

interface TableRow {
    id: string;
    guest: string;
    property: string;
    rating: number;
    comment: string;
    sentiment: string;
    status: string;
    date: string;
}

const stats: Stat[] = [
    {
        title: "Overall Rating",
        value: "4.72",
        icon: Star,
        color: "text-yellow-500",
        subtitle: "2,400 reviews",
    },
    {
        title: "Positive Sentiment",
        value: "88%",
        icon: ThumbsUp,
        color: "text-green-600",
        subtitle: "2,112 reviews",
    },
    {
        title: "Flagged Reviews",
        value: "2",
        icon: Flag,
        color: "text-red-500",
        subtitle: "Needs attention",
    },
    {
        title: "Pending Response",
        value: "8",
        icon: MessageSquare,
        color: "text-blue-600",
        subtitle: "Awaiting reply",
    },
];

const ratingDistribution: RatingDistribution[] = [
    { stars: 5, percentage: 52, color: "#22c55e" },
    { stars: 4, percentage: 30, color: "#3b82f6" },
    { stars: 3, percentage: 10, color: "#eab308" },
    { stars: 2, percentage: 4, color: "#f97316" },
    { stars: 1, percentage: 4, color: "#ef4444" },
];

const sentimentData: SentimentData[] = [
    { name: "Positive", value: 88, color: "#22c55e" },
    { name: "Neutral", value: 20, color: "#eab308" },
    { name: "Negative", value: 12, color: "#ef4444" },
];

const moderationQueue: ModerationQueue = {
    flagged: 2,
    pendingResponse: 8,
    thisWeek: 47,
    responded: 39,
};

const recentReviews: RecentReview[] = [
    {
        id: "1",
        name: "Priya S.",
        property: "Grand Vista",
        rating: 5,
        comment:
            "Absolutely stunning property. The staff was incredibly attentive and the suite exceeded all expectations. Will definitely return!",
        sentiment: "positive",
        flagged: false,
        reported: true,
        date: "2 hours ago",
    },
    {
        id: "2",
        name: "Rahul M.",
        property: "Skyline Suite",
        rating: 2,
        comment:
            "Room service was extremely slow. Waited 90 minutes for breakfast. The room itself was fine but service was unacceptable for this price point.",
        sentiment: "negative",
        flagged: true,
        reported: true,
        date: "5 hours ago",
    },
    {
        id: "3",
        name: "Ananya I.",
        property: "Azure Heights",
        rating: 4,
        comment:
            "Beautiful property with great views. Check-in was smooth. Minor issue with hot water but was resolved quickly.",
        sentiment: "positive",
        flagged: false,
        reported: true,
        date: "1 day ago",
    },
    {
        id: "4",
        name: "Vikram N.",
        property: "Emerald Palace",
        rating: 5,
        comment:
            "The Royal Suite was worth every rupee. Impeccable service throughout our 5-day stay. The concierge arranged everything perfectly.",
        sentiment: "positive",
        flagged: false,
        reported: true,
        date: "2 days ago",
    },
    {
        id: "5",
        name: "Deepika R.",
        property: "Coastal Breeze",
        rating: 1,
        comment:
            "Terrible experience. Found cockroaches in the room. AC not working. Asked for refund which was denied initially. Would not recommend.",
        sentiment: "negative",
        flagged: true,
        reported: true,
        date: "3 days ago",
    },
];

const tableData: TableRow[] = [
    {
        id: "1",
        guest: "Priya S.",
        property: "Grand Vista",
        rating: 5,
        comment: "Absolutely stunning property. The staff was incredibly attentive...",
        sentiment: "Positive",
        status: "Published",
        date: "2026-06-25",
    },
    {
        id: "2",
        guest: "Rahul M.",
        property: "Skyline Suite",
        rating: 2,
        comment: "Room service was extremely slow. Waited 90 minutes for breakfast...",
        sentiment: "Negative",
        status: "Flagged",
        date: "2026-06-25",
    },
    {
        id: "3",
        guest: "Ananya I.",
        property: "Azure Heights",
        rating: 4,
        comment: "Beautiful property with great views. Check-in was smooth...",
        sentiment: "Positive",
        status: "Published",
        date: "2026-06-24",
    },
    {
        id: "4",
        guest: "Vikram N.",
        property: "Emerald Palace",
        rating: 5,
        comment: "The Royal Suite was worth every rupee. Impeccable service...",
        sentiment: "Positive",
        status: "Published",
        date: "2026-06-23",
    },
    {
        id: "5",
        guest: "Deepika R.",
        property: "Coastal Breeze",
        rating: 1,
        comment: "Terrible experience. Found cockroaches in the room...",
        sentiment: "Negative",
        status: "Flagged",
        date: "2026-06-22",
    },
];

const sentimentColors = {
    positive: "bg-green-100 text-green-700",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-yellow-100 text-yellow-700",
};

export default function ReviewsSentimentSection() {

    const columns = useMemo<ColumnDef<TableRow>[]>(
        () => [
            {
                key: "guest",
                header: "GUEST",
                accessor: "guest",
                render: (value) => (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                            {String(value).charAt(0)}
                        </div>
                        <span className="font-medium">{String(value)}</span>
                    </div>
                ),
            },
            {
                key: "property",
                header: "PROPERTY",
                accessor: "property",
            },
            {
                key: "rating",
                header: "RATING",
                accessor: "rating",
                render: (value) => {
                    const rating = Number(value);
                    return (
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-sm">{rating}</span>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                },
            },
            {
                key: "comment",
                header: "COMMENT",
                accessor: "comment",
                render: (value) => (
                    <span className="text-sm text-slate-600 line-clamp-2 max-w-[200px]">
                        {String(value)}
                    </span>
                ),
            },
            {
                key: "sentiment",
                header: "SENTIMENT",
                accessor: "sentiment",
                render: (value) => {
                    const sentiment = String(value).toLowerCase() as keyof typeof sentimentColors;
                    const icons = {
                        positive: <ThumbsUp size={12} className="mr-1" />,
                        negative: <ThumbsDown size={12} className="mr-1" />,
                        neutral: <AlertTriangle size={12} className="mr-1" />,
                    };
                    return (
                        <span
                            className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sentimentColors[sentiment]}`}
                        >
                            {icons[sentiment]}
                            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                        </span>
                    );
                },
            },
            {
                key: "status",
                header: "STATUS",
                accessor: "status",
                render: (value) => {
                    const status = String(value);
                    const styles = {
                        Published: "bg-green-100 text-green-700",
                        Flagged: "bg-red-100 text-red-700",
                        Pending: "bg-yellow-100 text-yellow-700",
                    };
                    const icons = {
                        Published: <CheckCircle size={12} className="mr-1" />,
                        Flagged: <Flag size={12} className="mr-1" />,
                        Pending: <Clock size={12} className="mr-1" />,
                    };
                    return (
                        <span
                            className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-slate-100 text-slate-700"
                                }`}
                        >
                            {icons[status as keyof typeof icons]}
                            {status}
                        </span>
                    );
                },
            },
            {
                key: "date",
                header: "DATE",
                accessor: "date",
                render: (value) => (
                    <span className="text-sm text-slate-500">{String(value)}</span>
                ),
            },
            {
                key: "actions",
                header: "ACTIONS",
                accessor: "id",
                render: () => (
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                            <MessageSquare size={15} className="text-blue-600" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            <Flag size={15} className="text-red-500" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                            <MoreHorizontal size={15} className="text-slate-400" />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.title}
                            className="group bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2.5 rounded-xl bg-slate-50 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">{stat.title}</p>
                                    <h2 className="text-2xl font-bold text-slate-900">{stat.value}</h2>
                                    <p className="text-xs text-slate-400">{stat.subtitle}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ===================== Charts Row ===================== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rating Distribution */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="font-semibold text-slate-900 mb-4">Rating Distribution</h3>
                    <div className="space-y-3">
                        {ratingDistribution.map((item) => (
                            <div key={item.stars} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-16">
                                    <span className="text-sm font-medium text-slate-700">{item.stars}</span>
                                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                                </div>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${item.percentage}%`,
                                            backgroundColor: item.color,
                                        }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-slate-600 w-12 text-right">
                                    {item.percentage}%
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                        <span className="text-slate-500">Overall Rating</span>
                        <span className="font-bold text-lg text-slate-900">4.72</span>
                        <span className="text-slate-500">2,400 reviews</span>
                    </div>
                </div>

                {/* AI Sentiment Analysis */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="font-semibold text-slate-900 mb-4">AI Sentiment Analysis</h3>
                    <div className="flex flex-col items-center">
                        <div className="w-[200px] h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sentimentData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                    >
                                        {sentimentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "white",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "12px",
                                            padding: "8px 12px",
                                            fontSize: "13px",
                                        }}
                                        formatter={(value) => [`${value}%`, "Sentiment"]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex gap-6 mt-2">
                            {sentimentData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm text-slate-600">
                                        {item.name}: <span className="font-semibold">{item.value}%</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ===================== Moderation Queue ===================== */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="font-semibold text-slate-900 mb-4">Moderation Queue</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-red-50 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                        <Flag size={24} className="text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{moderationQueue.flagged}</p>
                        <p className="text-sm text-slate-600">Flagged Reviews</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                        <Clock size={24} className="text-yellow-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{moderationQueue.pendingResponse}</p>
                        <p className="text-sm text-slate-600">Pending Response</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                        <Calendar size={24} className="text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{moderationQueue.thisWeek}</p>
                        <p className="text-sm text-slate-600">This Week</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                        <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-slate-900">{moderationQueue.responded}</p>
                        <p className="text-sm text-slate-600">Responded</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-slate-900 mb-4">Recent Reviews</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recentReviews?.map((review) => (
                        <div
                            key={review.id}
                            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{review.name}</h4>
                                        <p className="text-sm text-slate-500 ">{review.property}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-3 mb-3">{review.comment}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${review.sentiment === "positive"
                                            ? "bg-green-100 text-green-700"
                                            : review.sentiment === "negative"
                                                ? "bg-red-100 text-red-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                                    </span>
                                    {review.flagged && (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                                            <Flag size={12} /> Flagged
                                        </span>
                                    )}
                                    {review.reported && (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                            Reported
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400">{review.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===================== All Reviews Table ===================== */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-100 gap-3">
                    <h3 className="font-semibold text-slate-900">All Reviews</h3>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-500">Total: {tableData.length} reviews</span>
                        <button className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
                            <Download size={16} />
                            Export CSV
                        </button>
                    </div>
                </div>
                <div className="p-4">
                    <DataTable
                        data={tableData}
                        columns={columns}
                        rowKey="id"
                        defaultView="table"
                        searchKeys={["guest", "property", "comment", "sentiment", "status"]}
                        searchPlaceholder="Search reviews..."
                    />
                </div>
            </div>
        </div>
    );
}