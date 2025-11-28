import { Box2DWeb } from "@akashic-extension/akashic-box2d";

export const toFixture = (def: Box2DWeb.Dynamics.b2FixtureDef): Box2DWeb.Dynamics.b2Fixture => {
    const f = new Box2DWeb.Dynamics.b2Fixture();
    f.SetDensity(def.density);
    f.m_filter = def.filter;
    f.SetFriction(def.friction);
    f.SetRestitution(def.restitution);
    f.SetSensor(def.isSensor);
    f.SetUserData(def.userData);
    return f;
};
