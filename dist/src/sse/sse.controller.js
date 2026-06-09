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
exports.SseController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const event_emitter_1 = require("@nestjs/event-emitter");
const rxjs_1 = require("rxjs");
let SseController = class SseController {
    subject = new rxjs_1.Subject();
    onJobUpdated(job) {
        this.subject.next({ data: job });
    }
    stream() {
        return this.subject.asObservable();
    }
};
exports.SseController = SseController;
__decorate([
    (0, event_emitter_1.OnEvent)('job.updated'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SseController.prototype, "onJobUpdated", null);
__decorate([
    (0, common_1.Sse)('jobs'),
    (0, swagger_1.ApiOperation)({ summary: 'SSE stream — real-time job status updates' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], SseController.prototype, "stream", null);
exports.SseController = SseController = __decorate([
    (0, swagger_1.ApiTags)('Scheduler Events'),
    (0, common_1.Controller)('sse')
], SseController);
//# sourceMappingURL=sse.controller.js.map