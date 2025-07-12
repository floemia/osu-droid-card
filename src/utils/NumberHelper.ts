;
export abstract class NumberHelper {
    public static toShort(number: number): string {
        return new Intl.NumberFormat("en-US", { compactDisplay: "short", notation: "compact", maximumFractionDigits: 3 }).format(number);
    }

    public static to2Decimal(number: number): string {
        return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(number);
    }

    public static toInt(number: number): string {
        return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(number);
    }

}