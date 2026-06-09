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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DlqController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dlq_service_1 = require("./dlq.service");
let DlqController = class DlqController {
    dlqService;
    constructor(dlqService) {
        this.dlqService = dlqService;
    }
    findAll() {
        return this.dlqService.findAll();
    }
    retry(id) {
        return this.dlqService.manualRetry(id);
    }
};
exports.DlqController = DlqController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all jobs in the DLQ' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DlqController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/retry'),
    (0, swagger_1.ApiOperation)({ summary: 'Manually retry a DLQ job' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Job not found or not in DLQ' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DlqController.prototype, "retry", null);
exports.DlqController = DlqController = __decorate([
    (0, swagger_1.ApiTags)('Dead Letter Queue'),
    (0, common_1.Controller)('dlq'),
    __metadata("design:paramtypes", [dlq_service_1.DlqService])
], DlqController);
//# sourceMappingURL=dlq.controller.js.map