/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  ageBand?: string;
  createdAt: string;
}

export interface AuthResponse {
  user?: UserProfile;
  token?: string;
  error?: string;
}
