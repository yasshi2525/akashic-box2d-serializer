import { EBody } from "@akashic-extension/akashic-box2d";

export const expectShallowEqualsBodies = (received: EBody[], expected: EBody[]): void => {
    expect(received.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
        expect(received[i].id).toBe(expected[i].id);
        expect(received[i].entity).toMatchObject({
            id: expected[i].entity.id,
            x: expected[i].entity.x,
            y: expected[i].entity.y,
            angle: expected[i].entity.angle,
        });
        expect(received[i].b2Body.GetPosition()).toEqual(expected[i].b2Body.GetPosition());
        expect(received[i].b2Body.GetLinearVelocity()).toEqual(expected[i].b2Body.GetLinearVelocity());
    }
};
