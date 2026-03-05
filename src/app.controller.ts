import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello(): string {
        return 'Ditto API is running!';
    }

    @Get('health')
    getHealth(): string {
        return 'OK';
    }
}
