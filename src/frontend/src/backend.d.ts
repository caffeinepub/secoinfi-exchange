import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    id: bigint;
    priceScore: number;
    fixtureId: bigint;
    warrantyScore: number;
    overallScore: number;
    serviceScore: number;
    createdAt: bigint;
    rank: bigint;
    productId: bigint;
    qualityScore: number;
    isWinner: boolean;
    sellerId: bigint;
    completedMatchCount: bigint;
}
export interface SellerProductOffer {
    id: bigint;
    termsSummary: string;
    serviceScore: bigint;
    shippingTimeDays: bigint;
    createdAt: bigint;
    productId: bigint;
    isActive: boolean;
    qualityScore: bigint;
    updatedAt: bigint;
    warrantyMonths: bigint;
    sellerId: bigint;
    priceOffer: number;
    priceMrp: number;
    quantityAvailable: bigint;
}
export interface SessionMerkleRoot {
    id: bigint;
    numLeaves: bigint;
    createdAt: bigint;
    merkleRootHash: string;
    sessionId: string;
}
export interface OperationResult {
    total: bigint;
    updated: bigint;
}
export interface Fixture {
    id: bigint;
    groupBSellerIds: Array<bigint>;
    status: string;
    startsAt: bigint;
    groupASellerIds: Array<bigint>;
    name: string;
    createdAt: bigint;
    productId: bigint;
    updatedAt: bigint;
    endsAt: bigint;
    scoringFormulaVersion: string;
}
export interface BuyerIntent {
    id: bigint;
    status: string;
    createdAt: bigint;
    productId: bigint;
    updatedAt: bigint;
    constraintsJson: string;
    buyerId: bigint;
    requestedQuantity: bigint;
}
export interface Match {
    id: bigint;
    status: string;
    fixtureId?: bigint;
    createdAt: bigint;
    settlementStatus: string;
    agreedPrice: number;
    buyerIntentId: bigint;
    updatedAt: bigint;
    sellerProductOfferId: bigint;
    quantity: bigint;
}
export interface AdminOperationLog {
    id: bigint;
    createdAt: bigint;
    summary: string;
    triggeredBy: string;
    operation: string;
}
export interface AdminMarkDisputedResult {
    success: boolean;
    reason: string;
}
export interface AdminMarkRefundedResult {
    success: boolean;
    reason: string;
}
export interface AutoMatchResult {
    skipped: bigint;
    matched: bigint;
}
export interface PreviewAutoMatchResult {
    intentFound: boolean;
    offer: SellerProductOffer | null;
}
export interface AdminCreateMatchResult {
    created: boolean;
    reason: string;
    matchId: bigint;
    sellerId: bigint;
    productId: bigint;
}
export interface SeedDemoResult {
    success: boolean;
    message: string;
    fixtureCount: bigint;
    offerCount: bigint;
    intentCount: bigint;
}
export interface MatchEvent {
    id: bigint;
    matchId: bigint;
    eventType: string;
    occurredAt: bigint;
}
export interface AppUser {
    id: bigint;
    buyerActivated: boolean;
    isApproved: boolean;
    principal: Principal;
    alias?: string;
    hashedIdentity?: string;
    createdAt: bigint;
    role: AppRole;
    businessName?: string;
    maskedTag?: string;
    isActive: boolean;
    email?: string;
    updatedAt: bigint;
    mobile?: string;
}
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface SessionTxn {
    id: bigint;
    createdAt: bigint;
    eventPayload: string;
    nonce: string;
    buyerId?: bigint;
    sellerId?: bigint;
    nonceSuffix: string;
    sessionId: string;
    eventType: string;
}
export interface UserWithoutMobile {
    id: bigint;
    buyerActivated: boolean;
    isApproved: boolean;
    principal: Principal;
    alias?: string;
    hashedIdentity?: string;
    createdAt: bigint;
    role: AppRole;
    businessName?: string;
    maskedTag?: string;
    isActive: boolean;
    email?: string;
    updatedAt: bigint;
}
export interface UserProfile {
    id: bigint;
    buyerActivated: boolean;
    isApproved: boolean;
    principal: Principal;
    alias?: string;
    hashedIdentity?: string;
    createdAt: bigint;
    role: AppRole;
    businessName?: string;
    maskedTag?: string;
    isActive: boolean;
    email?: string;
    updatedAt: bigint;
    mobile?: string;
}
export interface Product {
    id: bigint;
    title: string;
    createdAt: bigint;
    baseSkuCode: string;
    description: string;
    updatedAt: bigint;
    attributes: string;
    category: string;
}
export enum AppRole {
    SELLER = "SELLER",
    BUYER = "BUYER",
    VIEWER = "VIEWER",
    ADMIN = "ADMIN"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminApproveUser(userId: bigint): Promise<void>;
    adminSeedDemoData(): Promise<SeedDemoResult>;
    adminCreateMatchFromIntent(intentId: bigint): Promise<AdminCreateMatchResult>;
    adminListAllIntents(): Promise<Array<BuyerIntent>>;
    adminListAllMatches(): Promise<Array<Match>>;
    adminListAllOffers(): Promise<Array<SellerProductOffer>>;
    adminListMatchEvents(matchId: bigint): Promise<Array<MatchEvent>>;
    adminListOperationLogs(): Promise<Array<AdminOperationLog>>;
    adminListSessionTxns(sessionId: string): Promise<Array<SessionTxn>>;
    adminListUsers(role: string | null): Promise<Array<UserWithoutMobile>>;
    adminPreviewAutoMatch(intentId: bigint): Promise<PreviewAutoMatchResult>;
    adminRecomputeLeaderboard(): Promise<OperationResult>;
    adminRunAutoMatching(): Promise<AutoMatchResult>;
    adminSetUserActive(userId: bigint, active: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBuyerIntent(productId: bigint, requestedQuantity: bigint, constraintsJson: string, sessionId: string): Promise<void>;
    createFixture(name: string, productId: bigint, groupASellerIds: Array<bigint>, groupBSellerIds: Array<bigint>, startsAt: bigint, endsAt: bigint, scoringFormulaVersion: string): Promise<void>;
    createLeaderboardEntry(fixtureId: bigint, sellerId: bigint, productId: bigint, priceScore: number, qualityScore: number, serviceScore: number, warrantyScore: number, overallScore: number, rank: bigint, isWinner: boolean): Promise<void>;
    createMatch(buyerIntentId: bigint, sellerProductOfferId: bigint, fixtureId: bigint | null, agreedPrice: number, quantity: bigint): Promise<void>;
    createOffer(productId: bigint, priceMrp: number, priceOffer: number, quantityAvailable: bigint, qualityScore: bigint, serviceScore: bigint, warrantyMonths: bigint, shippingTimeDays: bigint, termsSummary: string): Promise<void>;
    createProduct(title: string, description: string, category: string, baseSkuCode: string, attributes: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFixture(id: bigint): Promise<Fixture | null>;
    getMyProfile(): Promise<UserWithoutMobile | null>;
    getProduct(id: bigint): Promise<Product | null>;
    getSessionMerkleRoot(sessionId: string): Promise<SessionMerkleRoot | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    listFixtures(): Promise<Array<Fixture>>;
    listLeaderboardByFixture(fixtureId: bigint): Promise<Array<LeaderboardEntry>>;
    listMatchesForSeller(): Promise<Array<Match>>;
    listMyIntents(): Promise<Array<BuyerIntent>>;
    listMyMatches(): Promise<Array<Match>>;
    listMyOffers(): Promise<Array<SellerProductOffer>>;
    listMySessionTxns(sessionId: string): Promise<Array<SessionTxn>>;
    listOffersByProduct(productId: bigint): Promise<Array<SellerProductOffer>>;
    listProducts(): Promise<Array<Product>>;
    registerBuyer(alias: string | null, mobile: string, sessionId: string): Promise<AppUser>;
    markBuyerActivated(sessionId: string): Promise<boolean>;
    registerSeller(businessName: string, email: string, sessionId: string): Promise<AppUser>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveSessionMerkleRoot(sessionId: string, merkleRootHash: string, numLeaves: bigint): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    updateFixtureStatus(id: bigint, status: string): Promise<void>;
    updateIntentStatus(id: bigint, status: string): Promise<void>;
    updateMatchStatus(id: bigint, status: string): Promise<void>;
    adminMarkMatchDisputed(matchId: bigint, disputeReason: [] | [string]): Promise<AdminMarkDisputedResult>;
    adminMarkMatchRefunded(matchId: bigint): Promise<AdminMarkRefundedResult>;
    updateOffer(id: bigint, productId: bigint, priceMrp: number, priceOffer: number, quantityAvailable: bigint, qualityScore: bigint, serviceScore: bigint, warrantyMonths: bigint, shippingTimeDays: bigint, termsSummary: string): Promise<void>;
    updateProduct(id: bigint, title: string, description: string, category: string, baseSkuCode: string, attributes: string): Promise<void>;
}
