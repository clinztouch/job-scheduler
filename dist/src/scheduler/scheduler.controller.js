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
exports.SchedulerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const timing_wheel_service_1 = require("./timing-wheel.service");
let SchedulerController = class SchedulerController {
    timingWheel;
    constructor(timingWheel) {
        this.timingWheel = timingWheel;
    }
    benchmark(count = '1000') {
        const jobCount = Math.min(parseInt(count), 10000);
        const results = this.timingWheel.benchmarkVsHeap(jobCount);
        return {
            jobCount,
            heapMs: results.heapMs,
            wheelMs: results.wheelMs,
            winner: results.heapMs < results.wheelMs ? 'heap' : 'timing-wheel',
            analysis: {
                heap: 'O(log n) insertion, dynamic priority reordering, best for mixed workloads',
                timingWheel: 'O(1) insertion into bucket, best for fixed-interval recurring jobs, less flexible on priority',
            },
        };
    }
};
exports.SchedulerController = SchedulerController;
__decorate([
    (0, common_1.Get)('benchmark'),
    (0, swagger_1.ApiOperation)({
        summary: 'Benchmark heap vs timing wheel',
        description: 'Inserts N jobs into both algorithms and returns insertion time in ms. Heap wins on dynamic priority changes, timing wheel wins on fixed-interval scheduling.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'count', required: false, example: 1000 }),
    __param(0, (0, common_1.Query)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "benchmark", null);
exports.SchedulerController = SchedulerController = __decorate([
    (0, swagger_1.ApiTags)('Scheduler Events'),
    (0, common_1.Controller)('scheduler'),
    __metadata("design:paramtypes", [timing_wheel_service_1.TimingWheelService])
], SchedulerController);
//# sourceMappingURL=scheduler.controller.js.map