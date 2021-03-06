import { MiddlewareFn } from "type-graphql";
import { ResReq } from "../interfaces/interfaces";
import { TeamMemberMapModel } from "../entities/TeamMemberMap";
import { TeamCoachMapModel } from "../entities/TeamCoachMap";

// Must run hasTeam middleware before isMember middleware
export const isMemberPayload: MiddlewareFn<ResReq> = async ({ context: { payload }, args }, next) => {
    const teamMemberPair = await TeamMemberMapModel.findOne({ "_id.team": args.teamID, "_id.user": payload._id });
    const teamCoachPair = await TeamCoachMapModel.findOne({ "_id.team": args.teamID, "_id.user": payload._id });
    if (teamMemberPair || teamCoachPair) {
        payload.isMember = true;
    } else {
        payload.isMember = false;
    }
    return next();
};
