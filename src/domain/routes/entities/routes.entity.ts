export class RoutesEntity {
  constructor(
    public id: number,
    public originCityId: number,
    public destinationCityId: number,
    public vehicleId: number,
    public assignedCarrierId: number | null,
    public assignedOrders: number[],
    public estimatedGeneralFinish: Date | null,
    public startDateTime: Date | null, 
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  get isValid(): boolean {
    return (
      this.originCityId !== this.destinationCityId &&
      this.vehicleId > 0 &&
      (this.assignedCarrierId === null || this.assignedCarrierId > 0)
    );
  }

  public static fromObject(object: { [key: string]: any }): RoutesEntity {
    return new RoutesEntity(
      object.id,
      object.origincityid,
      object.destinationcityid,
      object.vehicleid,
      object.assignedcarrierid || null,
      object.assignedorders || [],
      object.estimatedgeneralfinish ? new Date(object.estimatedgeneralfinish) : null,
      object.startdatetime ? new Date(object.startdatetime) : null,
      object.createdat ? new Date(object.createdat) : new Date(),
      object.updatedat ? new Date(object.updatedat) : new Date()
    );
  }
}
