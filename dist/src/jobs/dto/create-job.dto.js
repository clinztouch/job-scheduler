"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJobDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateJobDto {
    type;
    payload;
    priority;
    scheduledAt;
    interval;
    dependsOn;
}
exports.CreateJobDto = CreateJobDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'send_email', description: 'Job type identifier' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: { to: 'test@gmail.com', subject: 'Welcome' } }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateJobDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '1=High, 2=Medium, 3=Low' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], CreateJobDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-06-10T10:00:00Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateJobDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'every_5_minutes',
        enum: ['every_1_minute', 'every_5_minutes', 'every_1_hour'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['every_1_minute', 'every_5_minutes', 'every_1_hour']),
    __metadata("design:type", String)
], CreateJobDto.prototype, "interval", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: ['uuid-of-job-1', 'uuid-of-job-2'],
        description: 'Job IDs this job depends on (DAG)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateJobDto.prototype, "dependsOn", void 0);
//# sourceMappingURL=create-job.dto.js.map