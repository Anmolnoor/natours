class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryStr };
    const excludedFields = ['page', 'sort', 'fields', 'limit'];
    excludedFields.forEach((el) => delete queryObj[el]);
    // console.log({ Filtering: queryObj });

    // 1B) Advance filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log({ Advance_filtering: JSON.parse(queryStr) });

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2) Sorting
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // queryTours = queryTours.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // 3) limiting the fields
    if (this.queryStr.fields) {
      const sortBy = this.queryStr.fields.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.select(sortBy);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  pagination() {
    // 4) Pagination
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
