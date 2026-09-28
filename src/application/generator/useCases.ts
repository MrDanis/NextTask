import type { Draw } from '@/domain/generator/Draw';
import { formatDrawCode } from '@/domain/generator/codes';
import type { GeneratorConfig } from '@/domain/generator/GeneratorConfig';
import type { DrawRepository } from '@/domain/generator/ports';
import type { UniqueDrawGenerator } from '@/domain/generator/UniqueDrawGenerator';
import type { DrawDto, GeneratorStatusDto } from './dto';

async function toDto(draw: Draw, repository: DrawRepository, config: GeneratorConfig): Promise<DrawDto> {
  const issued = await repository.countIssued(config.scope);
  return {
    numbers: [...draw.numbers],
    issuedAt: draw.issuedAt.toISOString(),
    code: formatDrawCode(config, draw.numbers),
    remaining: config.combinations - issued,
  };
}

/** "Generate a number" as the UI understands it. Knows nothing about how uniqueness is achieved. */
export class GenerateDraw {
  constructor(
    private readonly generator: UniqueDrawGenerator,
    private readonly repository: DrawRepository,
    private readonly config: GeneratorConfig,
  ) {}

  async execute(): Promise<DrawDto> {
    return toDto(await this.generator.generate(this.config), this.repository, this.config);
  }
}

/** Issues numbers the user typed, under exactly the same rules as generated ones. */
export class ClaimDraw {
  constructor(
    private readonly generator: UniqueDrawGenerator,
    private readonly repository: DrawRepository,
    private readonly config: GeneratorConfig,
  ) {}

  async execute(numbers: readonly unknown[]): Promise<DrawDto> {
    return toDto(await this.generator.claim(this.config, numbers), this.repository, this.config);
  }
}

export class GetGeneratorStatus {
  constructor(
    private readonly repository: DrawRepository,
    private readonly config: GeneratorConfig,
  ) {}

  async execute(): Promise<GeneratorStatusDto> {
    const issued = await this.repository.countIssued(this.config.scope);
    const { count, min, max, combinations } = this.config;
    return { count, min, max, combinations, remaining: combinations - issued };
  }
}
