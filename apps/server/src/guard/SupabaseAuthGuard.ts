import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient, UserResponse } from "@supabase/supabase-js";
import { Request } from "express";
import { AppConfig } from "../config";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService<AppConfig>) {
    this.supabaseClient = createClient(
      this.configService.get("supabaseUrl"),
      this.configService.get("supabaseAnonKey"),
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(`No authorization token provided`);
    }

    let supabaseUser: UserResponse | undefined;
    try {
      supabaseUser = await this.supabaseClient.auth.getUser(token);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      throw new UnauthorizedException(`Invalid authorization token`);
    }

    return !!supabaseUser;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" && token !== undefined ? token : undefined;
  }
}
