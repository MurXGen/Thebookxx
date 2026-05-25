// # 15% increase, round to nearest 9, skip ₹1 products
// perl -pi -e 's/discountedPrice: \K(\d+)/($1 == 1 ? 1 : int((int($1*1.15)+5)\/10)*10-1)/ge' book.js
// perl -pi -e 's/calculateOriginalPrice\(\K(\d+)/($1 == 1 ? 1 : int((int($1*1.15)+5)\/10)*10-1)/ge' book.js
// echo "✅ Prices increased by 15% and rounded to nearest 9 (₹1 products unchanged)"
