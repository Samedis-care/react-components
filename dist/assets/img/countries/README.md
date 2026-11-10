The flags in this folder are the 3x2 set of country-flag-icons, version 1.6.20, which is MIT licensed (the license is below).

The package: https://www.npmjs.com/package/country-flag-icons

The project: https://gitlab.com/catamphetamine/country-flag-icons

Every flag is 3:2 and drawn for small sizes, with simplified emblems.

`scripts/make_country_data.py` downloads the flags from the package's pinned version on unpkg (`FLAG_SOURCE`). It only downloads missing flags, so to update them: change the version in `FLAG_SOURCE` and in this file, delete the SVGs in this folder, run the script, and copy the package's license below again if it changed.

## License of country-flag-icons

(The MIT License)

Copyright (c) 2020 @catamphetamine <purecatamphetamine@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
