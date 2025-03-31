export class OrdersEntity {
  constructor(
    public id: number,
    public code: string | null,
    public userId: number,
    public packageWeight: number,
    public packageDimensionWidth: number,
    public packageDimensionHeight: number,
    public packageDimensionLength: number,
    public typeProduct: string | null,
    public originCityId: number,
    public destinationCityId: number,
    public destinationAddress: string | null,
    public status: string,
    public estimatedDeliveryTime?: Date,
    public deliveredAt?: Date,
    public routeId?: number | null,
    public createdAt?: Date,
    public updatedAt?: Date
  ) { }

  get isValid(): boolean {
    return (
      this.userId > 0 &&
      this.packageWeight > 0 &&
      this.packageDimensionWidth > 0 &&
      this.packageDimensionHeight > 0 &&
      this.packageDimensionLength > 0 &&
      this.originCityId > 0 &&
      this.destinationCityId > 0 &&
      this.status.trim() !== ''
    );
  }

  public static fromObject(object: { [key: string]: any }): OrdersEntity {
    return new OrdersEntity(
      object.id,
      object.code || null,
      object.userid,
      object.packageweight,
      object.packagedimensionwidth,
      object.packagedimensionheight,
      object.packagedimensionlength,
      object.typeproduct || null,
      object.origincityid,
      object.destinationcityid,
      object.destinationaddress || null,
      object.status,
      object.estimateddeliverytime ? new Date(object.estimateddeliverytime) : undefined,
      object.deliveredat ? new Date(object.deliveredat) : undefined,
      object.routeid || null,
      object.createdat ? new Date(object.createdat) : undefined,
      object.updatedat ? new Date(object.updatedat) : undefined
    );
  }
}
