export const validateTransaction = (req, res, next) => {
  const {
    asset_symbol,
    transaction_type,
    quantity,
    unit_price,
    transaction_date,
  } = req.body;

  if (
    !asset_symbol ||
    !transaction_type ||
    quantity === undefined ||
    unit_price === undefined ||
    !transaction_date
  ) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided.",
    });
  }

  if (!["BUY", "SELL"].includes(transaction_type.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: "Transaction type must be BUY or SELL.",
    });
  }

  if (Number(quantity) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Quantity must be greater than zero.",
    });
  }

  if (Number(unit_price) <= 0) {
    return res.status(400).json({
      success: false,
      message: "Unit price must be greater than zero.",
    });
  }

  next();
};