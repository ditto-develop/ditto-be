import { Injectable } from '@nestjs/common';
import { CommandHandler } from '@common/command/command-handler.decorator';
import { ICommandHandler } from '@common/command/command-handler.interface';
import { ICommandResult } from '@common/command/command.interface';
import { KakaoPlaceSearchResultDto } from '@module/chat/application/dto/vote.dto';
import { SearchPlacesUseCase } from '@module/chat/application/usecases/search-places.usecase';
import { SearchPlacesCommand } from '../search-places.command';

@Injectable()
@CommandHandler(SearchPlacesCommand)
export class SearchPlacesHandler implements ICommandHandler<SearchPlacesCommand, KakaoPlaceSearchResultDto[]> {
  constructor(private readonly useCase: SearchPlacesUseCase) {}

  async execute(command: SearchPlacesCommand): Promise<ICommandResult<KakaoPlaceSearchResultDto[]>> {
    try {
      const data = await this.useCase.execute(command.requesterId, command.query, command.size);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : '알 수 없는 오류' };
    }
  }
}
