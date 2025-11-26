import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateQuizSetDto } from '../dto/create-quiz-set.dto';
import { UpdateQuizSetDto } from '../dto/update-quiz-set.dto';
import { QuizSetResponseDto } from '../dto/quiz-set-response.dto';
import { CreateQuizSetUseCase } from '../../application/usecases/create-quiz-set.usecase';
import { UpdateQuizSetUseCase } from '../../application/usecases/update-quiz-set.usecase';
import { GetQuizSetUseCase } from '../../application/usecases/get-quiz-set.usecase';
import { DeleteQuizSetUseCase } from '../../application/usecases/delete-quiz-set.usecase';
import { CreateQuizSetCommand } from '../../application/commands/create-quiz-set.command';
import { UpdateQuizSetCommand } from '../../application/commands/update-quiz-set.command';
import { DeleteQuizSetCommand } from '../../application/commands/delete-quiz-set.command';
import { GetQuizSetQuery, GetQuizSetsByWeekAndCategoryQuery, GetAllQuizSetsQuery } from '../../application/queries/get-quiz-set.query';

@ApiTags('Quiz Sets')
@Controller('quiz-sets')
@UsePipes(new ValidationPipe())
export class QuizSetController {
  constructor(
    private readonly createQuizSetUseCase: CreateQuizSetUseCase,
    private readonly updateQuizSetUseCase: UpdateQuizSetUseCase,
    private readonly getQuizSetUseCase: GetQuizSetUseCase,
    private readonly deleteQuizSetUseCase: DeleteQuizSetUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new quiz set' })
  @ApiResponse({ status: 201, description: 'Quiz set created successfully', type: QuizSetResponseDto })
  async create(@Body() createQuizSetDto: CreateQuizSetDto): Promise<QuizSetResponseDto> {
    const command = new CreateQuizSetCommand(
      createQuizSetDto.id,
      createQuizSetDto.week,
      createQuizSetDto.category,
      createQuizSetDto.title,
      createQuizSetDto.description,
      createQuizSetDto.startDate,
    );

    const quizSet = await this.createQuizSetUseCase.execute(command);
    return QuizSetResponseDto.fromEntity(quizSet);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quiz sets' })
  @ApiResponse({ status: 200, description: 'Quiz sets retrieved successfully', type: [QuizSetResponseDto] })
  async findAll(): Promise<QuizSetResponseDto[]> {
    const query = new GetAllQuizSetsQuery();
    const quizSets = await this.getQuizSetUseCase.getAll(query);
    return quizSets.map(quizSet => QuizSetResponseDto.fromEntity(quizSet));
  }

  @Get('by-week-category')
  @ApiOperation({ summary: 'Get quiz set by week and category' })
  @ApiQuery({ name: 'week', required: true, type: Number })
  @ApiQuery({ name: 'category', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Quiz set retrieved successfully', type: QuizSetResponseDto })
  async findByWeekAndCategory(
    @Query('week') week: number,
    @Query('category') category: string,
  ): Promise<QuizSetResponseDto | null> {
    const query = new GetQuizSetsByWeekAndCategoryQuery(week, category);
    const quizSet = await this.getQuizSetUseCase.getByWeekAndCategory(query);
    return quizSet ? QuizSetResponseDto.fromEntity(quizSet) : null;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quiz set by ID' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Quiz set retrieved successfully', type: QuizSetResponseDto })
  async findOne(@Param('id') id: string): Promise<QuizSetResponseDto | null> {
    const query = new GetQuizSetQuery(id);
    const quizSet = await this.getQuizSetUseCase.getById(query);
    return quizSet ? QuizSetResponseDto.fromEntity(quizSet) : null;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quiz set' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Quiz set updated successfully', type: QuizSetResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateQuizSetDto: UpdateQuizSetDto,
  ): Promise<QuizSetResponseDto> {
    const command = new UpdateQuizSetCommand(
      id,
      updateQuizSetDto.week,
      updateQuizSetDto.category,
      updateQuizSetDto.title,
      updateQuizSetDto.description,
      updateQuizSetDto.startDate,
    );

    const quizSet = await this.updateQuizSetUseCase.execute(command);
    return QuizSetResponseDto.fromEntity(quizSet);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quiz set' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Quiz set deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    const command = new DeleteQuizSetCommand(id);
    await this.deleteQuizSetUseCase.execute(command);
  }
}


