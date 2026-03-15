import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import Blob "mo:core/Blob";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  public type AppRole = {
    #ADMIN;
    #BUYER;
    #SELLER;
    #VIEWER;
  };

  public type AppUser = {
    id : Nat;
    principal : Principal;
    role : AppRole;
    email : ?Text;
    mobile : ?Text;
    businessName : ?Text;
    alias : ?Text;
    hashedIdentity : ?Text;
    maskedTag : ?Text;
    isApproved : Bool;
    isActive : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Product = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    baseSkuCode : Text;
    attributes : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type SellerProductOffer = {
    id : Nat;
    sellerId : Nat;
    productId : Nat;
    priceMrp : Float;
    priceOffer : Float;
    quantityAvailable : Nat;
    qualityScore : Nat;
    serviceScore : Nat;
    warrantyMonths : Nat;
    shippingTimeDays : Nat;
    termsSummary : Text;
    isActive : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Fixture = {
    id : Nat;
    name : Text;
    productId : Nat;
    groupASellerIds : [Nat];
    groupBSellerIds : [Nat];
    startsAt : Int;
    endsAt : Int;
    status : Text;
    scoringFormulaVersion : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type LeaderboardEntry = {
    id : Nat;
    fixtureId : Nat;
    sellerId : Nat;
    productId : Nat;
    priceScore : Float;
    qualityScore : Float;
    serviceScore : Float;
    warrantyScore : Float;
    overallScore : Float;
    rank : Nat;
    isWinner : Bool;
    createdAt : Int;
  };

  public type BuyerIntent = {
    id : Nat;
    buyerId : Nat;
    productId : Nat;
    requestedQuantity : Nat;
    constraintsJson : Text;
    status : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type Match = {
    id : Nat;
    buyerIntentId : Nat;
    sellerProductOfferId : Nat;
    fixtureId : ?Nat;
    agreedPrice : Float;
    quantity : Nat;
    status : Text;
    settlementStatus : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type SessionTxn = {
    id : Nat;
    buyerId : ?Nat;
    sellerId : ?Nat;
    sessionId : Text;
    eventType : Text;
    eventPayload : Text;
    nonce : Text;
    nonceSuffix : Text;
    createdAt : Int;
  };

  public type SessionMerkleRoot = {
    id : Nat;
    sessionId : Text;
    merkleRootHash : Text;
    numLeaves : Nat;
    createdAt : Int;
  };

  public type UserProfile = AppUser;

  public type AdminOperationLog = {
    id : Nat;
    operation : Text;
    summary : Text;
    triggeredBy : Text;
    createdAt : Int;
  };

  type UserWithoutMobile = {
    id : Nat;
    principal : Principal;
    role : AppRole;
    businessName : ?Text;
    alias : ?Text;
    hashedIdentity : ?Text;
    maskedTag : ?Text;
    email : ?Text;
    isApproved : Bool;
    isActive : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  public type OperationResult = {
    updated : Nat;
    total : Nat;
  };

  public type AutoMatchResult = {
    matched : Nat;
    skipped : Nat;
  };

  let users = Map.empty<Principal, AppUser>();
  let usersByNat = Map.empty<Nat, AppUser>();
  let products = Map.empty<Nat, Product>();
  let sellerProductOffers = Map.empty<Nat, SellerProductOffer>();
  let fixtures = Map.empty<Nat, Fixture>();
  let leaderboardEntries = Map.empty<Nat, LeaderboardEntry>();
  let buyerIntents = Map.empty<Nat, BuyerIntent>();
  let matches = Map.empty<Nat, Match>();
  let sessionTxns = Map.empty<Nat, SessionTxn>();
  let sessionMerkleRoots = Map.empty<Text, SessionMerkleRoot>();
  let sessionsByUser = Map.empty<Principal, [Text]>();
  let adminOperationLogs = Map.empty<Nat, AdminOperationLog>();

  var nextUserId = 1;
  var nextProductId = 1;
  var nextOfferId = 1;
  var nextFixtureId = 1;
  var nextLeaderboardEntryId = 1;
  var nextBuyerIntentId = 1;
  var nextMatchId = 1;
  var nextTxnId = 1;
  var nextMerkleRootId = 1;
  var nextAdminOperationLogId = 1;

  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);
  include MixinAuthorization(accessControlState);

  func getCurrentTime() : Int {
    Time.now();
  };

  func hashText(text : Text) : Text {
    let blob = text.encodeUtf8();
    blob.size().toText();
  };

  func getMaskedTag(text : Text) : Text {
    let len = text.size();
    if (len <= 4) {
      text;
    } else {
      let chars = text.toArray();
      let lastFour = Array.tabulate(4, func(i) { chars[len - 4 + i] });
      Text.fromArray(lastFour);
    };
  };

  func getUserByPrincipal(principal : Principal) : ?AppUser {
    users.get(principal);
  };

  func getUserById(id : Nat) : ?AppUser {
    usersByNat.get(id);
  };

  func isAppAdmin(caller : Principal) : Bool {
    switch (getUserByPrincipal(caller)) {
      case (?user) {
        switch (user.role) {
          case (#ADMIN) { user.isActive };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isApprovedBuyer(caller : Principal) : Bool {
    switch (getUserByPrincipal(caller)) {
      case (?user) {
        switch (user.role) {
          case (#BUYER) { user.isApproved and user.isActive };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func isApprovedSeller(caller : Principal) : Bool {
    switch (getUserByPrincipal(caller)) {
      case (?user) {
        switch (user.role) {
          case (#SELLER) { user.isApproved and user.isActive };
          case (_) { false };
        };
      };
      case (null) { false };
    };
  };

  func toUserWithoutMobile(user : AppUser) : UserWithoutMobile {
    {
      id = user.id;
      principal = user.principal;
      role = user.role;
      email = user.email;
      businessName = user.businessName;
      alias = user.alias;
      hashedIdentity = user.hashedIdentity;
      maskedTag = user.maskedTag;
      isApproved = user.isApproved;
      isActive = user.isActive;
      createdAt = user.createdAt;
      updatedAt = user.updatedAt;
    };
  };

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  public shared ({ caller }) func registerBuyer(alias : ?Text, mobile : Text, sessionId : Text) : async AppUser {
    switch (getUserByPrincipal(caller)) {
      case (?_) { Runtime.trap("User already registered") };
      case (null) {};
    };

    let hashedIdentity = hashText(mobile # getCurrentTime().toText());
    let maskedTag = getMaskedTag(mobile);

    let newUser : AppUser = {
      id = nextUserId;
      principal = caller;
      role = #BUYER;
      email = null;
      mobile = ?mobile;
      businessName = null;
      alias = alias;
      hashedIdentity = ?hashedIdentity;
      maskedTag = ?maskedTag;
      isApproved = true;
      isActive = true;
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
    };

    users.add(caller, newUser);
    usersByNat.add(nextUserId, newUser);
    nextUserId += 1;

    let txn : SessionTxn = {
      id = nextTxnId;
      buyerId = ?newUser.id;
      sellerId = null;
      sessionId = sessionId;
      eventType = "REGISTRATION";
      eventPayload = "{\"role\":\"BUYER\",\"userId\":" # newUser.id.toText() # "}";
      nonce = hashText(sessionId # nextTxnId.toText() # getCurrentTime().toText());
      nonceSuffix = getMaskedTag(hashText(sessionId # nextTxnId.toText()));
      createdAt = getCurrentTime();
    };
    sessionTxns.add(nextTxnId, txn);
    nextTxnId += 1;

    switch (sessionsByUser.get(caller)) {
      case (?sessions) {
        let updated = sessions.concat([sessionId]);
        sessionsByUser.add(caller, updated);
      };
      case (null) {
        sessionsByUser.add(caller, [sessionId]);
      };
    };

    AccessControl.assignRole(accessControlState, caller, caller, #user);

    newUser;
  };

  public shared ({ caller }) func registerSeller(businessName : Text, email : Text, sessionId : Text) : async AppUser {
    switch (getUserByPrincipal(caller)) {
      case (?_) { Runtime.trap("User already registered") };
      case (null) {};
    };

    let newUser : AppUser = {
      id = nextUserId;
      principal = caller;
      role = #SELLER;
      email = ?email;
      mobile = null;
      businessName = ?businessName;
      alias = null;
      hashedIdentity = null;
      maskedTag = null;
      isApproved = false;
      isActive = true;
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
    };

    users.add(caller, newUser);
    usersByNat.add(nextUserId, newUser);
    nextUserId += 1;

    let txn : SessionTxn = {
      id = nextTxnId;
      buyerId = null;
      sellerId = ?newUser.id;
      sessionId = sessionId;
      eventType = "REGISTRATION";
      eventPayload = "{\"role\":\"SELLER\",\"userId\":" # newUser.id.toText() # "}";
      nonce = hashText(sessionId # nextTxnId.toText() # getCurrentTime().toText());
      nonceSuffix = getMaskedTag(hashText(sessionId # nextTxnId.toText()));
      createdAt = getCurrentTime();
    };
    sessionTxns.add(nextTxnId, txn);
    nextTxnId += 1;

    switch (sessionsByUser.get(caller)) {
      case (?sessions) {
        let updated = sessions.concat([sessionId]);
        sessionsByUser.add(caller, updated);
      };
      case (null) {
        sessionsByUser.add(caller, [sessionId]);
      };
    };

    AccessControl.assignRole(accessControlState, caller, caller, #user);

    newUser;
  };

  public query ({ caller }) func getMyProfile() : async ?UserWithoutMobile {
    switch (getUserByPrincipal(caller)) {
      case (?user) {
        if (isAppAdmin(caller)) {
          ?toUserWithoutMobile(user);
        } else {
          ?toUserWithoutMobile(user);
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    getUserByPrincipal(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    getUserByPrincipal(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
    usersByNat.add(profile.id, profile);
  };

  public query ({ caller }) func adminListUsers(role : ?Text) : async [UserWithoutMobile] {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let allUsers = users.values().toArray();
    let filtered = switch (role) {
      case (?r) {
        allUsers.filter(func(u) {
          switch (u.role) {
            case (#ADMIN) { r == "ADMIN" };
            case (#BUYER) { r == "BUYER" };
            case (#SELLER) { r == "SELLER" };
            case (#VIEWER) { r == "VIEWER" };
          };
        });
      };
      case (null) { allUsers };
    };

    filtered.map<AppUser, UserWithoutMobile>(toUserWithoutMobile);
  };

  public shared ({ caller }) func adminApproveUser(userId : Nat) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    switch (getUserById(userId)) {
      case (?user) {
        let updated = {
          id = user.id;
          principal = user.principal;
          role = user.role;
          email = user.email;
          mobile = user.mobile;
          businessName = user.businessName;
          alias = user.alias;
          hashedIdentity = user.hashedIdentity;
          maskedTag = user.maskedTag;
          isApproved = true;
          isActive = user.isActive;
          createdAt = user.createdAt;
          updatedAt = getCurrentTime();
        };
        users.add(user.principal, updated);
        usersByNat.add(userId, updated);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func adminSetUserActive(userId : Nat, active : Bool) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    switch (getUserById(userId)) {
      case (?user) {
        let updated = {
          id = user.id;
          principal = user.principal;
          role = user.role;
          email = user.email;
          mobile = user.mobile;
          businessName = user.businessName;
          alias = user.alias;
          hashedIdentity = user.hashedIdentity;
          maskedTag = user.maskedTag;
          isApproved = user.isApproved;
          isActive = active;
          createdAt = user.createdAt;
          updatedAt = getCurrentTime();
        };
        users.add(user.principal, updated);
        usersByNat.add(userId, updated);
      };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func createProduct(title : Text, description : Text, category : Text, baseSkuCode : Text, attributes : Text) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let product = {
      id = nextProductId;
      title;
      description;
      category;
      baseSkuCode;
      attributes;
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
    };

    products.add(nextProductId, product);
    nextProductId += 1;
  };

  public shared ({ caller }) func updateProduct(id : Nat, title : Text, description : Text, category : Text, baseSkuCode : Text, attributes : Text) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    switch (products.get(id)) {
      case (?_) {
        let updated = {
          id;
          title;
          description;
          category;
          baseSkuCode;
          attributes;
          createdAt = getCurrentTime();
          updatedAt = getCurrentTime();
        };
        products.add(id, updated);
      };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public query func listProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getProduct(id : Nat) : async ?Product {
    products.get(id);
  };

  public shared ({ caller }) func createOffer(productId : Nat, priceMrp : Float, priceOffer : Float, quantityAvailable : Nat, qualityScore : Nat, serviceScore : Nat, warrantyMonths : Nat, shippingTimeDays : Nat, termsSummary : Text) : async () {
    if (not isApprovedSeller(caller)) {
      Runtime.trap("Unauthorized: Only approved sellers can create offers");
    };

    let user = switch (getUserByPrincipal(caller)) {
      case (?u) { u };
      case (null) { Runtime.trap("User not found") };
    };

    let newOffer : SellerProductOffer = {
      id = nextOfferId;
      sellerId = user.id;
      productId;
      priceMrp;
      priceOffer;
      quantityAvailable;
      qualityScore;
      serviceScore;
      warrantyMonths;
      shippingTimeDays;
      termsSummary;
      isActive = true;
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
    };

    sellerProductOffers.add(nextOfferId, newOffer);
    nextOfferId += 1;
  };

  public shared ({ caller }) func updateOffer(id : Nat, productId : Nat, priceMrp : Float, priceOffer : Float, quantityAvailable : Nat, qualityScore : Nat, serviceScore : Nat, warrantyMonths : Nat, shippingTimeDays : Nat, termsSummary : Text) : async () {
    if (not isApprovedSeller(caller)) {
      Runtime.trap("Unauthorized: Only approved sellers can update offers");
    };

    let user = switch (getUserByPrincipal(caller)) {
      case (?u) { u };
      case (null) { Runtime.trap("User not found") };
    };

    switch (sellerProductOffers.get(id)) {
      case (?offer) {
        if (offer.sellerId != user.id) {
          Runtime.trap("Unauthorized: Can only update your own offers");
        };

        let updated = {
          id;
          sellerId = offer.sellerId;
          productId;
          priceMrp;
          priceOffer;
          quantityAvailable;
          qualityScore;
          serviceScore;
          warrantyMonths;
          shippingTimeDays;
          termsSummary;
          isActive = offer.isActive;
          createdAt = offer.createdAt;
          updatedAt = getCurrentTime();
        };
        sellerProductOffers.add(id, updated);
      };
      case (null) { Runtime.trap("Offer not found") };
    };
  };

  public query ({ caller }) func listMyOffers() : async [SellerProductOffer] {
    if (not isApprovedSeller(caller)) {
      Runtime.trap("Unauthorized: Only sellers can view their offers");
    };

    let user = switch (getUserByPrincipal(caller)) {
      case (?u) { u };
      case (null) { Runtime.trap("User not found") };
    };

    let allOffers = sellerProductOffers.values().toArray();
    allOffers.filter<SellerProductOffer>(func(o) { o.sellerId == user.id });
  };

  public query func listOffersByProduct(productId : Nat) : async [SellerProductOffer] {
    let allOffers = sellerProductOffers.values().toArray();
    allOffers.filter<SellerProductOffer>(func(o) { o.productId == productId and o.isActive });
  };

  public query ({ caller }) func adminListAllOffers() : async [SellerProductOffer] {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    sellerProductOffers.values().toArray();
  };

  public shared ({ caller }) func createFixture(name : Text, productId : Nat, groupASellerIds : [Nat], groupBSellerIds : [Nat], startsAt : Int, endsAt : Int, scoringFormulaVersion : Text) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let newFixture = {
      id = nextFixtureId;
      name;
      productId;
      groupASellerIds;
      groupBSellerIds;
      status = "PLANNED";
      startsAt;
      endsAt;
      scoringFormulaVersion;
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
    };

    fixtures.add(nextFixtureId, newFixture);
    nextFixtureId += 1;
  };

  public shared ({ caller }) func updateFixtureStatus(id : Nat, status : Text) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    switch (fixtures.get(id)) {
      case (?fixture) {
        let updated = {
          id;
          name = fixture.name;
          productId = fixture.productId;
          groupASellerIds = fixture.groupASellerIds;
          groupBSellerIds = fixture.groupBSellerIds;
          status;
          startsAt = fixture.startsAt;
          endsAt = fixture.endsAt;
          scoringFormulaVersion = fixture.scoringFormulaVersion;
          createdAt = fixture.createdAt;
          updatedAt = getCurrentTime();
        };
        fixtures.add(id, updated);
      };
      case (null) { Runtime.trap("Fixture not found") };
    };
  };

  public query func listFixtures() : async [Fixture] {
    fixtures.values().toArray();
  };

  public query func getFixture(id : Nat) : async ?Fixture {
    fixtures.get(id);
  };

  public shared ({ caller }) func createLeaderboardEntry(fixtureId : Nat, sellerId : Nat, productId : Nat, priceScore : Float, qualityScore : Float, serviceScore : Float, warrantyScore : Float, overallScore : Float, rank : Nat, isWinner : Bool) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let newEntry = {
      id = nextLeaderboardEntryId;
      fixtureId;
      sellerId;
      productId;
      priceScore;
      qualityScore;
      serviceScore;
      warrantyScore;
      overallScore;
      rank;
      isWinner;
      createdAt = getCurrentTime();
    };

    leaderboardEntries.add(nextLeaderboardEntryId, newEntry);
    nextLeaderboardEntryId += 1;
  };

  public query func listLeaderboardByFixture(fixtureId : Nat) : async [LeaderboardEntry] {
    let allEntries = leaderboardEntries.values().toArray();
    let filtered = allEntries.filter(func(e) { e.fixtureId == fixtureId });
    filtered.sort<LeaderboardEntry>(func(a, b) { Nat.compare(a.rank, b.rank) });
  };

  public shared ({ caller }) func createBuyerIntent(productId : Nat, requestedQuantity : Nat, constraintsJson : Text, sessionId : Text) : async () {
    if (not isApprovedBuyer(caller)) {
      Runtime.trap("Unauthorized: Only approved buyers can create intents");
    };

    let user = switch (getUserByPrincipal(caller)) {
      case (?u) { u };
      case (null) { Runtime.trap("User not found") };
    };

    let newIntent : BuyerIntent = {
      id = nextBuyerIntentId;
      buyerId = user.id;
      productId;
      requestedQuantity;
      constraintsJson;
      status = "OPEN";
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
    };

    buyerIntents.add(nextBuyerIntentId, newIntent);
    nextBuyerIntentId += 1;

    let txn : SessionTxn = {
      id = nextTxnId;
      buyerId = ?user.id;
      sellerId = null;
      sessionId;
      eventType = "BUYER_INTENT_CREATED";
      eventPayload = "{\"intentId\":" # newIntent.id.toText() # ",\"productId\":" # productId.toText() # "}";
      nonce = hashText(sessionId # nextTxnId.toText() # getCurrentTime().toText());
      nonceSuffix = getMaskedTag(hashText(sessionId # nextTxnId.toText()));
      createdAt = getCurrentTime();
    };
    sessionTxns.add(nextTxnId, txn);
    nextTxnId += 1;
  };

  public query ({ caller }) func listMyIntents() : async [BuyerIntent] {
    if (not isApprovedBuyer(caller)) {
      Runtime.trap("Unauthorized: Only buyers can view their intents");
    };

    let user = switch (getUserByPrincipal(caller)) {
      case (?u) { u };
      case (null) { Runtime.trap("User not found") };
    };

    let allIntents = buyerIntents.values().toArray();
    allIntents.filter<BuyerIntent>(func(i) { i.buyerId == user.id });
  };

  public query ({ caller }) func adminListAllIntents() : async [BuyerIntent] {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    buyerIntents.values().toArray();
  };

  public shared ({ caller }) func updateIntentStatus(id : Nat, status : Text) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    switch (buyerIntents.get(id)) {
      case (?intent) {
        let updated = {
          id;
          buyerId = intent.buyerId;
          productId = intent.productId;
          requestedQuantity = intent.requestedQuantity;
          constraintsJson = intent.constraintsJson;
          status;
          createdAt = intent.createdAt;
          updatedAt = getCurrentTime();
        };
        buyerIntents.add(id, updated);
      };
      case (null) { Runtime.trap("Intent not found") };
    };
  };

  public shared ({ caller }) func createMatch(buyerIntentId : Nat, sellerProductOfferId : Nat, fixtureId : ?Nat, agreedPrice : Float, quantity : Nat) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let newMatch = {
      id = nextMatchId;
      buyerIntentId;
      sellerProductOfferId;
      fixtureId;
      agreedPrice;
      quantity;
      status = "PLACED";
      settlementStatus = "PENDING";
      createdAt = getCurrentTime();
      updatedAt = getCurrentTime();
    };

    matches.add(nextMatchId, newMatch);
    nextMatchId += 1;
  };

  public query ({ caller }) func listMyMatches() : async [Match] {
    if (not isApprovedBuyer(caller)) {
      Runtime.trap("Unauthorized: Only buyers can view their matches");
    };

    let user = switch (getUserByPrincipal(caller)) {
      case (?u) { u };
      case (null) { Runtime.trap("User not found") };
    };

    let allMatches = matches.values().toArray();
    allMatches.filter<Match>(func(m) {
      switch (buyerIntents.get(m.buyerIntentId)) {
        case (?intent) { intent.buyerId == user.id };
        case (null) { false };
      };
    });
  };

  public query ({ caller }) func listMatchesForSeller() : async [Match] {
    if (not isApprovedSeller(caller)) {
      Runtime.trap("Unauthorized: Only sellers can view their matches");
    };

    let user = switch (getUserByPrincipal(caller)) {
      case (?u) { u };
      case (null) { Runtime.trap("User not found") };
    };

    let allMatches = matches.values().toArray();
    allMatches.filter<Match>(func(m) {
      switch (sellerProductOffers.get(m.sellerProductOfferId)) {
        case (?offer) { offer.sellerId == user.id };
        case (null) { false };
      };
    });
  };

  public query ({ caller }) func adminListAllMatches() : async [Match] {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    matches.values().toArray();
  };

  public shared ({ caller }) func updateMatchStatus(id : Nat, status : Text) : async () {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    switch (matches.get(id)) {
      case (?match) {
        let updated = {
          id;
          buyerIntentId = match.buyerIntentId;
          sellerProductOfferId = match.sellerProductOfferId;
          fixtureId = match.fixtureId;
          agreedPrice = match.agreedPrice;
          quantity = match.quantity;
          status;
          settlementStatus = match.settlementStatus;
          createdAt = match.createdAt;
          updatedAt = getCurrentTime();
        };
        matches.add(id, updated);
      };
      case (null) { Runtime.trap("Match not found") };
    };
  };

  public query ({ caller }) func listMySessionTxns(sessionId : Text) : async [SessionTxn] {
    let userSessions = switch (sessionsByUser.get(caller)) {
      case (?sessions) { sessions };
      case (null) { [] };
    };

    let hasSession = userSessions.find(func(s) { s == sessionId });
    switch (hasSession) {
      case (?_) {
        let allTxns = sessionTxns.values().toArray();
        allTxns.filter<SessionTxn>(func(t) { t.sessionId == sessionId });
      };
      case (null) { Runtime.trap("Unauthorized: Session does not belong to caller") };
    };
  };

  public query ({ caller }) func adminListSessionTxns(sessionId : Text) : async [SessionTxn] {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    let allTxns = sessionTxns.values().toArray();
    allTxns.filter<SessionTxn>(func(t) { t.sessionId == sessionId });
  };

  public shared ({ caller }) func saveSessionMerkleRoot(sessionId : Text, merkleRootHash : Text, numLeaves : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save merkle roots");
    };

    let userSessions = switch (sessionsByUser.get(caller)) {
      case (?sessions) { sessions };
      case (null) { [] };
    };

    let hasSession = userSessions.find(func(s) { s == sessionId });
    switch (hasSession) {
      case (?_) {
        let newRoot = {
          id = nextMerkleRootId;
          sessionId;
          merkleRootHash;
          numLeaves;
          createdAt = getCurrentTime();
        };
        sessionMerkleRoots.add(sessionId, newRoot);
        nextMerkleRootId += 1;
      };
      case (null) { Runtime.trap("Unauthorized: Session does not belong to caller") };
    };
  };

  public query func getSessionMerkleRoot(sessionId : Text) : async ?SessionMerkleRoot {
    sessionMerkleRoots.get(sessionId);
  };

  public query ({ caller }) func adminListOperationLogs() : async [AdminOperationLog] {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };
    let allLogs = adminOperationLogs.values().toArray();
    allLogs.sort<AdminOperationLog>(func(a, b) { Int.compare(b.createdAt, a.createdAt) });
  };

  public shared ({ caller }) func adminRecomputeLeaderboard() : async OperationResult {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    var updated = 0;
    var total = 0;

    let allOffers = sellerProductOffers.values().toArray();
    let activeOffers = allOffers.filter(func(o) { o.isActive });

    for (offer in activeOffers.values()) {
      total += 1;

      let allMatches = matches.values().toArray();
      let offerMatches = allMatches.filter(func(m) { m.sellerProductOfferId == offer.id });
      let completedMatches = offerMatches.filter(func(m) { m.status == "DELIVERED" });

      let allTxns = sessionTxns.values().toArray();
      let sellerTxns = allTxns.filter(func(t) {
        switch (t.sellerId) {
          case (?sid) { sid == offer.sellerId and t.eventType == "MATCH_COMPLETED" };
          case (null) { false };
        };
      });
      let sortedTxns = sellerTxns.sort(func(a, b) { Int.compare(b.createdAt, a.createdAt) });
      let lastCompletedTxn = if (sortedTxns.size() > 0) { ?sortedTxns[0] } else { null };

      let priceScore = if (offer.priceMrp > 0.0) {
        let ratio = 1.0 - (offer.priceOffer / offer.priceMrp);
        let score = ratio * 100.0 * 0.40;
        if (score < 0.0) { 0.0 } else if (score > 40.0) { 40.0 } else { score };
      } else { 0.0 };

      let reliabilityScore = if (offerMatches.size() > 0) {
        let ratio = completedMatches.size().toFloat() / offerMatches.size().toFloat();
        let score = ratio * 100.0 * 0.35;
        if (score < 0.0) { 0.0 } else if (score > 35.0) { 35.0 } else { score };
      } else { 0.0 };

      let recencyScore = switch (lastCompletedTxn) {
        case (?txn) {
          let now = getCurrentTime();
          let age = now - txn.createdAt;
          let thirtyDays = 30 * 24 * 60 * 60 * 1_000_000_000;
          let ninetyDays = 90 * 24 * 60 * 60 * 1_000_000_000;
          if (age <= thirtyDays) { 25.0 }
          else if (age <= ninetyDays) { 12.5 }
          else { 0.0 };
        };
        case (null) { 0.0 };
      };

      let overallScore = priceScore + reliabilityScore + recencyScore;

      let existingEntries = leaderboardEntries.values().toArray();
      let existingEntry = existingEntries.find(func(e) {
        e.fixtureId == 0 and e.sellerId == offer.sellerId and e.productId == offer.productId
      });

      switch (existingEntry) {
        case (?entry) {
          let updatedEntry = {
            id = entry.id;
            fixtureId = 0;
            sellerId = offer.sellerId;
            productId = offer.productId;
            priceScore;
            qualityScore = recencyScore;
            serviceScore = reliabilityScore;
            warrantyScore = entry.warrantyScore;
            overallScore;
            rank = entry.rank;
            isWinner = false;
            createdAt = entry.createdAt;
          };
          leaderboardEntries.add(entry.id, updatedEntry);
        };
        case (null) {
          let newEntry = {
            id = nextLeaderboardEntryId;
            fixtureId = 0;
            sellerId = offer.sellerId;
            productId = offer.productId;
            priceScore;
            qualityScore = recencyScore;
            serviceScore = reliabilityScore;
            warrantyScore = 0.0;
            overallScore;
            rank = 0;
            isWinner = false;
            createdAt = getCurrentTime();
          };
          leaderboardEntries.add(nextLeaderboardEntryId, newEntry);
          nextLeaderboardEntryId += 1;
        };
      };

      updated += 1;
    };

    let allEntries = leaderboardEntries.values().toArray();
    let globalEntries = allEntries.filter(func(e) { e.fixtureId == 0 });

    let productIds = Map.empty<Nat, Bool>();
    for (entry in globalEntries.values()) {
      productIds.add(entry.productId, true);
    };

    for ((productId, _) in productIds.entries()) {
      let productEntries = globalEntries.filter(func(e) { e.productId == productId });
      let sorted = productEntries.sort(func(a, b) {
        Float.compare(b.overallScore, a.overallScore)
      });

      var rank = 1;
      for (entry in sorted.values()) {
        let updatedEntry = {
          id = entry.id;
          fixtureId = entry.fixtureId;
          sellerId = entry.sellerId;
          productId = entry.productId;
          priceScore = entry.priceScore;
          qualityScore = entry.qualityScore;
          serviceScore = entry.serviceScore;
          warrantyScore = entry.warrantyScore;
          overallScore = entry.overallScore;
          rank;
          isWinner = (rank == 1);
          createdAt = entry.createdAt;
        };
        leaderboardEntries.add(entry.id, updatedEntry);
        rank += 1;
      };
    };

    let logEntry : AdminOperationLog = {
      id = nextAdminOperationLogId;
      operation = "RECOMPUTE_LEADERBOARD";
      summary = "Updated " # updated.toText() # " of " # total.toText() # " offers";
      triggeredBy = "ADMIN";
      createdAt = getCurrentTime();
    };
    adminOperationLogs.add(nextAdminOperationLogId, logEntry);
    nextAdminOperationLogId += 1;

    { updated; total };
  };

  public shared ({ caller }) func adminRunAutoMatching() : async AutoMatchResult {
    if (not isAppAdmin(caller)) {
      Runtime.trap("Unauthorized: Admin only");
    };

    var matched = 0;
    var skipped = 0;

    let allIntents = buyerIntents.values().toArray();
    let openIntents = allIntents.filter(func(i) { i.status == "OPEN" });

    for (intent in openIntents.values()) {
      let matchingOffers = sellerProductOffers.values().toArray().filter(
        func(o) {
          o.productId == intent.productId and o.quantityAvailable >= intent.requestedQuantity and o.isActive
        }
      );

      if (matchingOffers.size() > 0) {
        let allLeaderboardEntries = leaderboardEntries.values().toArray();

        let offersWithScores = matchingOffers.map(func(offer) {
          let leaderboardEntry = allLeaderboardEntries.find(func(e) {
            e.sellerId == offer.sellerId and e.productId == offer.productId
          });
          let score = switch (leaderboardEntry) {
            case (?entry) { entry.overallScore };
            case (null) { 0.0 };
          };
          (offer, score);
        });

        let sortedOffers = offersWithScores.sort(func(a, b) {
          Float.compare(b.1, a.1)
        });

        let bestOffer = sortedOffers[0].0;
        let bestScore = sortedOffers[0].1;

        let newMatch : Match = {
          id = nextMatchId;
          buyerIntentId = intent.id;
          sellerProductOfferId = bestOffer.id;
          fixtureId = null;
          agreedPrice = bestOffer.priceOffer;
          quantity = intent.requestedQuantity;
          status = "PLACED";
          settlementStatus = "PENDING";
          createdAt = getCurrentTime();
          updatedAt = getCurrentTime();
        };

        matches.add(nextMatchId, newMatch);

        let txn : SessionTxn = {
          id = nextTxnId;
          buyerId = ?intent.buyerId;
          sellerId = ?bestOffer.sellerId;
          sessionId = "AUTO_MATCH_SESSION";
          eventType = "AUTO_MATCH";
          eventPayload = "{\"matchId\":" # nextMatchId.toText() # ",\"offerId\":" # bestOffer.id.toText() # ",\"sellerId\":" # bestOffer.sellerId.toText() # ",\"score\":" # bestScore.toText() # "}";
          nonce = hashText("AUTO_MATCH_SESSION" # nextTxnId.toText() # getCurrentTime().toText());
          nonceSuffix = getMaskedTag(hashText("AUTO_MATCH_SESSION" # nextTxnId.toText()));
          createdAt = getCurrentTime();
        };
        sessionTxns.add(nextTxnId, txn);
        nextTxnId += 1;

        let updatedIntent = {
          id = intent.id;
          buyerId = intent.buyerId;
          productId = intent.productId;
          requestedQuantity = intent.requestedQuantity;
          constraintsJson = intent.constraintsJson;
          status = "MATCHED";
          createdAt = intent.createdAt;
          updatedAt = getCurrentTime();
        };
        buyerIntents.add(intent.id, updatedIntent);

        let updatedOffer = {
          id = bestOffer.id;
          sellerId = bestOffer.sellerId;
          productId = bestOffer.productId;
          priceMrp = bestOffer.priceMrp;
          priceOffer = bestOffer.priceOffer;
          quantityAvailable = bestOffer.quantityAvailable - intent.requestedQuantity;
          qualityScore = bestOffer.qualityScore;
          serviceScore = bestOffer.serviceScore;
          warrantyMonths = bestOffer.warrantyMonths;
          shippingTimeDays = bestOffer.shippingTimeDays;
          termsSummary = bestOffer.termsSummary;
          isActive = bestOffer.isActive;
          createdAt = bestOffer.createdAt;
          updatedAt = getCurrentTime();
        };
        sellerProductOffers.add(bestOffer.id, updatedOffer);

        nextMatchId += 1;
        matched += 1;
      } else {
        skipped += 1;
      };
    };

    let logEntry : AdminOperationLog = {
      id = nextAdminOperationLogId;
      operation = "AUTO_MATCHING";
      summary = "Matched " # matched.toText() # ", Skipped " # skipped.toText();
      triggeredBy = "ADMIN";
      createdAt = getCurrentTime();
    };
    adminOperationLogs.add(nextAdminOperationLogId, logEntry);
    nextAdminOperationLogId += 1;

    { matched; skipped };
  };
};
