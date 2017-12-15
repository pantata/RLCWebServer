#!/usr/bin/env ruby

def hex2bin(hexFile)
  bin = []
  File.readlines(hexFile).each do |line|
    # get the length of data
    lineLen = line[1,2].to_i(16)
    puts "Linelen #{lineLen}"
    # make sure it is a data line
    if lineLen > 0 and line[7,2] == '00'
      # parse the data into an array
      bindata = line[9,2 * lineLen]
      puts "bindata #{bindata}"
      lineLen.times do |i|
        bin << bindata[i*2,2].to_i(16)
      end
    end
  end
  # Pad to a multiple of 4 for reading / writing to flash
  (bin.length % 4).times{ bin << 0 }
  bin.pack('C*')
end

hexFile = ARGV[0]
binFile = ARGV[1]

puts "Reading hex file"
fw = hex2bin(hexFile)

File.open(binFile, 'w') { |file| file.write(fw) }

