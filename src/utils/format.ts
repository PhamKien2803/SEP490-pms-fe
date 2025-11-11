import { ScheduleDay } from "../types/parent";

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

export const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const groupDaysIntoWeeks = (
    days: ScheduleDay[]
): { label: string; key: string; days: ScheduleDay[] }[] => {
    if (days.length === 0) return [];

    const sortedDays = [...days].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const weeks: { [key: string]: ScheduleDay[] } = {};

    sortedDays.forEach((day) => {
        const date = new Date(day.date);
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

        const monday = new Date(date);
        monday.setDate(diff);

        const weekKey = monday.toISOString().split("T")[0];

        if (!weeks[weekKey]) {
            weeks[weekKey] = [];
        }
        weeks[weekKey].push(day);
    });

    return Object.keys(weeks).map((key, index) => {
        const startDate = new Date(key);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const label = `Tuần ${index + 1}: ${startDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        })} - ${endDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        })}`;

        return {
            label: label,
            key: key,
            days: weeks[key].sort(
                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            ),
        };
    });
};

export const formatMinutesToTime = (minutes: number) => {
    if (isNaN(minutes) || minutes === null) return "N/A";
    const hours = Math.floor(minutes / 60)
        .toString()
        .padStart(2, "0");
    const mins = (minutes % 60).toString().padStart(2, "0");
    return `${hours}:${mins}`;
};