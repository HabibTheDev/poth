type PrismaModel = {
  findMany: (args?: any) => Promise<any[]>;
  count: (args?: any) => Promise<number>;
};

interface QueryParams {
  searchTerm?: string;
  sort?: string;
  limit?: string | number;
  page?: string | number;
  fields?: string;
  [key: string]: any;
}

class QueryBuilder<T extends PrismaModel> {
  private model: T;
  private query: QueryParams;
  private where: any = {};
  private orderBy: any = {};
  private select: any = undefined;
  private skip: number = 0;
  private take: number = 10;

  constructor(model: T, query: QueryParams) {
    this.model = model;
    this.query = query;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm;
    if (searchTerm && searchableFields.length > 0) {
      this.where.OR = searchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      }));
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    
    excludeFields.forEach((field) => delete queryObj[field]);

    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] !== undefined && queryObj[key] !== '') {
        this.where[key] = queryObj[key];
      }
    });

    return this;
  }

  sort() {
    const sortParam = this.query?.sort as string;
    if (sortParam) {
      const sortFields = sortParam.split(',');
      this.orderBy = sortFields.map((field) => {
        const isDescending = field.startsWith('-');
        const fieldName = isDescending ? field.slice(1) : field;
        return {
          [fieldName]: isDescending ? 'desc' : 'asc',
        };
      });
    } else {
      this.orderBy = { createdAt: 'desc' };
    }
    return this;
  }

  paginate() {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    this.skip = (page - 1) * limit;
    this.take = limit;
    return this;
  }

  fields() {
    const fieldsParam = this.query?.fields as string;
    if (fieldsParam) {
      const selectedFields = fieldsParam.split(',');
      this.select = selectedFields.reduce((acc, field) => {
        const isExclude = field.startsWith('-');
        const fieldName = isExclude ? field.slice(1) : field;
        acc[fieldName] = !isExclude;
        return acc;
      }, {} as Record<string, boolean>);
    }
    return this;
  }

  async execute() {
    const args: any = {
      where: this.where,
      orderBy: this.orderBy,
      skip: this.skip,
      take: this.take,
    };

    if (this.select) {
      args.select = this.select;
    }

    return await this.model.findMany(args);
  }

  async countTotal() {
    const total = await this.model.count({ where: this.where });
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;

