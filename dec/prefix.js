/* Copyright 2013 Google Inc. All Rights Reserved.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   Lookup tables to map prefix codes to value ranges. This is used during
   decoding of the block lengths, literal insertion lengths and copy lengths.
*/

/* Represents the range of values belonging to a prefix code: */
/* [offset, offset + 2^nbits) */
function prefixCodeRange(offset, nbits) {
  return { offset, nbits };
}

export const kBlockLengthPrefixCode = [
  prefixCodeRange(1, 2), prefixCodeRange(5, 2), prefixCodeRange(9, 2), prefixCodeRange(13, 2),
  prefixCodeRange(17, 3), prefixCodeRange(25, 3), prefixCodeRange(33, 3), prefixCodeRange(41, 3),
  prefixCodeRange(49, 4), prefixCodeRange(65, 4), prefixCodeRange(81, 4), prefixCodeRange(97, 4),
  prefixCodeRange(113, 5), prefixCodeRange(145, 5), prefixCodeRange(177, 5), prefixCodeRange(209, 5),
  prefixCodeRange(241, 6), prefixCodeRange(305, 6), prefixCodeRange(369, 7), prefixCodeRange(497, 8),
  prefixCodeRange(753, 9), prefixCodeRange(1265, 10), prefixCodeRange(2289, 11), prefixCodeRange(4337, 12),
  prefixCodeRange(8433, 13), prefixCodeRange(16625, 24)
];

export const kInsertLengthPrefixCode = [
  prefixCodeRange(0, 0), prefixCodeRange(1, 0), prefixCodeRange(2, 0), prefixCodeRange(3, 0),
  prefixCodeRange(4, 0), prefixCodeRange(5, 0), prefixCodeRange(6, 1), prefixCodeRange(8, 1),
  prefixCodeRange(10, 2), prefixCodeRange(14, 2), prefixCodeRange(18, 3), prefixCodeRange(26, 3),
  prefixCodeRange(34, 4), prefixCodeRange(50, 4), prefixCodeRange(66, 5), prefixCodeRange(98, 5),
  prefixCodeRange(130, 6), prefixCodeRange(194, 7), prefixCodeRange(322, 8), prefixCodeRange(578, 9),
  prefixCodeRange(1090, 10), prefixCodeRange(2114, 12), prefixCodeRange(6210, 14), prefixCodeRange(22594, 24),
];

export const kCopyLengthPrefixCode = [
  prefixCodeRange(2, 0), prefixCodeRange(3, 0), prefixCodeRange(4, 0), prefixCodeRange(5, 0),
  prefixCodeRange(6, 0), prefixCodeRange(7, 0), prefixCodeRange(8, 0), prefixCodeRange(9, 0),
  prefixCodeRange(10, 1), prefixCodeRange(12, 1), prefixCodeRange(14, 2), prefixCodeRange(18, 2),
  prefixCodeRange(22, 3), prefixCodeRange(30, 3), prefixCodeRange(38, 4), prefixCodeRange(54, 4),
  prefixCodeRange(70, 5), prefixCodeRange(102, 5), prefixCodeRange(134, 6), prefixCodeRange(198, 7),
  prefixCodeRange(326, 8), prefixCodeRange(582, 9), prefixCodeRange(1094, 10), prefixCodeRange(2118, 24),
];

export const kInsertRangeLut = [
  0, 0, 8, 8, 0, 16, 8, 16, 16,
];

export const kCopyRangeLut = [
  0, 8, 0, 8, 16, 0, 16, 8, 16,
];
