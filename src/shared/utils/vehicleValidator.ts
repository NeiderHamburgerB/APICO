import { calculateOrderVolume } from './volumeCalculator';

export function canVehicleCarryOrder(
    vehicle: { capacity: number; maxVolume: number; maxWidth: number; maxHeight: number; maxLength: number },
    orders: { weight: number; width: number; height: number; length: number }[]
): boolean {
    let totalWeight = 0;
    let totalVolume = 0;

    for (const order of orders) {
        totalWeight += order.weight;
        const orderVolume = calculateOrderVolume(order.width, order.height, order.length);
        totalVolume += orderVolume;

        if (order.width > vehicle.maxWidth || order.height > vehicle.maxHeight || order.length > vehicle.maxLength) {
            return false;
        }
    }
    if (totalWeight > vehicle.capacity || totalVolume > vehicle.maxVolume) {
        return false;
    }

    return true;
}
