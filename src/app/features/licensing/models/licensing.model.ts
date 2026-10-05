export type LicensingMode = 'USER_DEVICE' | 'DEVICE_ONLY';
export type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED';
export type DeviceStatus = 'PENDING' | 'ENROLLED' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'INACTIVE';
export type DeviceOrigin = 'MANUAL' | 'AUTO';
export interface LicensedApplication { id:string; code:string; name:string; packageName:string; licensingMode:LicensingMode; status:string; }
export interface LicensedDevice { id:string; deviceUuid:string|null; displayName:string|null; manufacturer:string|null; model:string|null; androidVersion:string|null; status:DeviceStatus; origin:DeviceOrigin; androidId:string|null; packageName:string|null; appVersion:string|null; publicKeyFingerprint:string|null; publicKeyAlgorithm:string|null; keySecurityLevel:'SOFTWARE'|'TEE'|'STRONGBOX'|'UNKNOWN'; attestationAvailable:boolean; attestationVerified:boolean; notes:string|null; registeredAt:string; enrolledAt:string|null; keyRotatedAt:string|null; lastValidationAt:string|null; updatedAt:string|null; enrollmentStatus:string|null; enrollmentExpiresAt:string|null; }
export interface License { id:string; applicationId:string; applicationCode:string; applicationName:string; licensingMode:LicensingMode; deviceId:string; deviceUuid:string; deviceName:string|null; userId:string|null; username:string|null; validFrom:string; validUntil:string; status:LicenseStatus; deviceStatus:DeviceStatus; operationalStatus:'READY'|'PENDING_ENROLLMENT'|'SUSPENDED'|'REVOKED'|'EXPIRED'; }
export interface ApplicationRequest { name:string; packageName:string; licensingMode:LicensingMode; status:string; }
export interface DeviceRequest { displayName:string|null; manufacturer:string|null; model:string|null; androidVersion:string|null; notes:string|null; }
export interface ManualDeviceRequest extends DeviceRequest { initialStatus:'PENDING'|'SUSPENDED'; }
export interface EnrollmentCodeResponse { code:string; expiresAt:string; }
export interface ManualDeviceCreated { device:LicensedDevice; enrollmentCode:string; expiresAt:string; }
export interface LicenseRequest { applicationId:string; deviceId:string; userId:string|null; validFrom:string; validUntil:string; status:LicenseStatus; }
export interface ApplicationVersion { id:string; applicationId:string; applicationName:string; versionName:string; versionCode:number|null; originalFileName:string; sha256:string; fileSize:number; minimumAndroid:string|null; releaseNotes:string|null; mandatory:boolean; published:boolean; createdAt:string; }
export interface UserApplicationAccess { id:string; userId:string; applicationId:string; applicationName:string; status:'ACTIVE'|'SUSPENDED'|'REVOKED'; validFrom:string; validUntil:string|null; maxDevices:number; createdAt:string; }
export interface AccessRequest { userId:string; applicationId:string; status:string; validFrom:string; validUntil:string|null; maxDevices:number; }
