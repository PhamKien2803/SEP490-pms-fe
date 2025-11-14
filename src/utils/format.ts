import { useMemo } from "react";
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

export const useValidationRules = () => {
    const phoneValidationRule = useMemo(() => ({
        pattern: /^\d{10}$/,
        message: 'Số điện thoại phải có đúng 10 chữ số!',
    }), []);

    const idCardValidationRule = useMemo(() => ({
        pattern: /^\d{12}$/,
        message: 'CCCD phải có đúng 12 chữ số!',
    }), []);

    const nameValidationRule = {
        pattern: /^[\p{L} ]+$/u,
        message: 'Chỉ được nhập chữ cái và dấu cách!',
    };

    return { phoneValidationRule, idCardValidationRule, nameValidationRule };
};

export const noSpecialCharactersandNumberRule = {
    pattern: /^[a-zA-ZÀ-ỹà-ỹ\s]+$/,
    message: "Không được nhập số hoặc ký tự đặc biệt!",
};

export const noSpecialCharactersRule = {
    pattern: /^[\p{L}0-9\s]+$/u,
    message: "Không được nhập ký tự đặc biệt!",
};


export const allowOnlyNumbers = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(event.key) && !['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key) && !event.ctrlKey) {
        event.preventDefault();
    }
};