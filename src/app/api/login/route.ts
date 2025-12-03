

// // new updated code with cookies

// import { prisma } from "@dbConfig/dbConfig";
// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { role } = body;

//     let route = "/";

//     if (role === "ORGANIZER") route = "/organizer";

//     if (role === "ORGANIZER") {
//       const { loginData } = body;
//       const { email, password } = loginData;

//       let existingUser = await prisma.user.findUnique({ where: { email } });

//       if (!existingUser) {
//         existingUser = await prisma.user.create({
//           data: {
//             email,
//             password,
//             role,
//           },
//         });
//       }
//       console.log("cookiesSetForOrganizer going to...")
//       // Set cookies for organizer
//       const cookieStore = await cookies();
//       cookieStore.set('user_id', existingUser.id.toString(), { 
//         httpOnly: true, 
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 // 7 days
//       });
//       cookieStore.set('user_role', existingUser.role, { 
//         httpOnly: true, 
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 
//       });
//       cookieStore.set('user_email', existingUser.email, { 
//         httpOnly: true, 
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 
//       });
//       console.log("cookiesSetForOrganizer done.")
//       return NextResponse.json({
//         message: "Login successful",
//         user: existingUser,
//         route,
//       });
//     }

//     // PANELIST or USER login using eventId + code
//     else {
//       const { eventId, code, email, password } = body;
    
//       if (role === "USER") route = `/event/${eventId}/user`;
//       else if (role === "PANELIST") route = `/event/${eventId}/panelist`;
//       if (!eventId || !code || !email || !password) {
//         return NextResponse.json(
//           { error: "Missing credentials" },
//           { status: 400 }
//         );
//       }

//       // check for panelist or user code validity with the eventId and code
//       let codeRecord = null;
//       if (role === "PANELIST") {
//         console.log("ppanelist",role)
//         codeRecord = await prisma.panelistCode.findUnique({
//           where: { eventId },
//           include: { event: true },
//         });
//         console.log("c:",codeRecord)
//         if (!codeRecord || codeRecord.code !== code) {
//           return NextResponse.json(
//             { error: "Invalid panelist login code" },
//             { status: 401 }
//           );
//         }
//       } else if (role === "USER") {

//         console.log("userCalled")
//         codeRecord = await prisma.participantCode.findUnique({
//           where: { eventId },
//           include: { event: true },
//         });
//         console.log("c:",codeRecord)

//         if (!codeRecord || codeRecord.code !== code) {
//           return NextResponse.json(
//             { error: "Invalid participant login code" },
//             { status: 401 }
//           );
//         }
//       }


//       let user = await prisma.user.findUnique({ where: { email } });
//       console.log("userFound:",user)
//       if (!user) {
//           user = await prisma.user.create({
//             data: {
//               email,
//               password,
//               role,
//             },
//           });

//         // Link code to this user
//           console.log("linkingCodeToUser...0",role)
//           if (role === "PANELIST") {
//             const ab = await prisma.panelistCode.update({
//               where: { eventId },
//               data: { userId: user.id },
//             });
//             console.log("loginAb:",ab)
            
//           } else if (role === "USER") {
//             await prisma.participantCode.update({
//               where: { eventId },
//               data: { userId: user.id },
//             });
//           }
//       }

//       // now i want to add the event for the user or panelist if user Found with authorization 
//       // if the event already linked then no issue otherwise link the eventId to the user or panelist
      
//       console.log("settingCookies for panelist or user...")
//       // Set cookies for panelist or user
//       const cookieStore = await cookies();
//       cookieStore.set('user_id', user.id.toString(), { 
//         httpOnly: true, 
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 
//       });
//       cookieStore.set('user_role', user.role, { 
//         httpOnly: true, 
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 
//       });
//       // eventId:
//         cookieStore.set('event_id', eventId, { 
//         httpOnly: true, 
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 
//       });
//       console.log("userRole:",user.email)
//       console.log("userEmail:",user.email)
//       cookieStore.set('user_email', user.email, { 
//         httpOnly: true, 
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict',
//         maxAge: 7 * 24 * 60 * 60 
//       });

//       return NextResponse.json({
//         message: "Login successful",
//         user,
//         route,
//       });
//     }

//   } catch (error) {
//     console.error("Login error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


import { prisma } from "@/dbConfig/dbConfig"; // Adjust path if necessary
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
// import { Role } from "@prisma/client"; // Import Enum for type safety
import { Role } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  console.log("[LOGIN API] Request received");
  try {
    let body;
    try {
      body = await request.json();
      console.log("[LOGIN API] Body parsed:", { role: body.role, hasEventId: !!body.eventId, hasCode: !!body.code });
    } catch (parseError) {
      console.error("[LOGIN API] JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }
    
    // "USER" comes from frontend, map it to DB Enum "PARTICIPANT"
    const requestedRoleStr = body.role;
    console.log("[LOGIN API] Processing role:", requestedRoleStr); 
    let dbRole: Role = Role.ORGANIZER; // Default

    // Logic to determine DB role and redirect route
    let route = "/";
    
    console.log("Requested Role:", body);
    if (requestedRoleStr === "ORGANIZER") {
      route = "/organizer";
      dbRole = Role.ORGANIZER;
    } else if (requestedRoleStr === "PANELIST") {
      dbRole = Role.PANELIST;
    } else if (requestedRoleStr === "USER" || requestedRoleStr === "PARTICIPANT") {
      dbRole = Role.PARTICIPANT;
    }

    // ---------------------------------------------------------
    // 1. ORGANIZER LOGIN FLOW
    // ---------------------------------------------------------
    if (requestedRoleStr === "ORGANIZER") {
      const { loginData } = body;
      const { email, password } = loginData;

      if (!email || !password) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
      }

      // Find or Create User (Generic)
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Create new generic user
        user = await prisma.user.create({
          data: { email, password }, // No role column here anymore
        });
      } else {
        // Simple password check (In production, use bcrypt/argon2)
        if (user.password !== password) {
          return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
      }

      // Set Cookies
      await setCookies(user.id, requestedRoleStr, user.email, null);

      return NextResponse.json({
        message: "Login successful",
        user,
        route,
      });
    }

    // ---------------------------------------------------------
    // 2. PARTICIPANT / PANELIST LOGIN FLOW (Event Based)
    // ---------------------------------------------------------
    else {
      let { eventId, code, email, password } = body;
      
      // Strip # prefix from eventId if present (safety check)
      if (eventId && typeof eventId === 'string' && eventId.startsWith('#')) {
        eventId = eventId.slice(1);
      }
      
      // Normalize code (trim whitespace and convert to uppercase for case-insensitive comparison)
      if (code && typeof code === 'string') {
        code = code.trim().toUpperCase();
      } else {
        code = String(code || '').trim().toUpperCase();
      }
      
      // Normalize email
      if (email && typeof email === 'string') {
        email = email.trim().toLowerCase();
      }
      
      // Define route based on input
      if (dbRole === Role.PARTICIPANT) route = `/event/${eventId}/user`;
      else if (dbRole === Role.PANELIST) route = `/event/${eventId}/panelist`;

      if (!eventId || !code || !email || !password) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
      }

      // A. Verify the Event and the Code
      // In the new schema, codes are directly on the Event model
      const event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      // Check codes based on the role they are trying to assume
      // Normalize event codes for comparison (handle null and case sensitivity)
      if (dbRole === Role.PANELIST) {
        const eventCode = event.panelistCode ? String(event.panelistCode).trim().toUpperCase() : null;
        if (!eventCode) {
          return NextResponse.json({ error: "Panelist code not set for this event" }, { status: 400 });
        }
        if (eventCode !== code) {
          return NextResponse.json({ error: "Invalid panelist code" }, { status: 401 });
        }
      } else if (dbRole === Role.PARTICIPANT) {
        const eventCode = event.participantCode ? String(event.participantCode).trim().toUpperCase() : null;
        if (!eventCode) {
          return NextResponse.json({ error: "Participant code not set for this event" }, { status: 400 });
        }
        if (eventCode !== code) {
          return NextResponse.json({ error: "Invalid participant code" }, { status: 401 });
        }
      }

      // B. Find or Create the User
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: { email, password },
        });
      } else {
        if (user.password !== password) {
          return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
      }

      // C. Link User to Event via EventRole
      // We use upsert to ensure the user is assigned the role for this specific event.
      // The schema constraint @@unique([userId, eventId]) ensures one role per event.
      await prisma.eventRole.upsert({
         where: {
          userId_eventId: {
            userId: user.id,
            eventId: eventId,
          },
        },
        update: {
          role: dbRole, 
          // SECURITY FIX: 
          // If the new role is PANELIST, force them out of any team (set teamId to null).
          // If the new role is PARTICIPANT, leave teamId alone (undefined).
          teamId: dbRole === Role.PANELIST ? null : undefined 
        },
        create: {
          userId: user.id,
          eventId: eventId,
          role: dbRole,
          // New entries have no team yet
          teamId: null,
        },
      });

      // Set Cookies
      await setCookies(user.id, requestedRoleStr, user.email, eventId);

      return NextResponse.json({
        message: "Login successful",
        user,
        route,
        dbRole,
        eventId
      });
    }

  } catch (error: unknown) {
    console.error("[LOGIN API] Error caught:", error);
    console.error("[LOGIN API] Error type:", typeof error);
    console.error("[LOGIN API] Error constructor:", error?.constructor?.name);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : String(error);
    
    // Log Prisma-specific errors
    if (error?.code) {
      console.error("Prisma error code:", error.code);
    }
    if (error?.meta) {
      console.error("Prisma error meta:", error.meta);
    }
    
    console.error("Error details:", { 
      errorMessage, 
      errorStack,
      errorCode: error?.code,
      errorMeta: error?.meta 
    });
    
    // Return more specific error messages in development
    // Always return error details in development mode for debugging
    const isDevelopment = process.env.NODE_ENV === "development" || process.env.NODE_ENV !== "production";
    
    try {
      return NextResponse.json(
        { 
          error: "Internal server error", 
          ...(isDevelopment && {
            details: errorMessage,
            code: error?.code,
            message: errorMessage
          })
        },
        { status: 500 }
      );
    } catch (responseError) {
      // If we can't create a JSON response, log and return a plain text error
      console.error("Failed to create error response:", responseError);
      return new NextResponse(
        `Internal server error: ${errorMessage}`,
        { status: 500, headers: { "Content-Type": "text/plain" } }
      );
    }
  }
}

/**
 * Helper function to set cookies consistently
 */
async function setCookies(userId: number, roleName: string, email: string, eventId: string | null) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const, // Type casting for TS
    maxAge: 7 * 24 * 60 * 60, // 7 days
  };

  cookieStore.set("user_id", userId.toString(), options);
  cookieStore.set("user_role", roleName, options); // Storing the "session context" role
  cookieStore.set("user_email", email, options);

  if (eventId) {
    cookieStore.set("event_id", eventId, options);
  }
}