#############################################################################
# Franck Hertz Experiment                                                   #
# Visualisation of the Franck Hertz Experiment in an Electron app.          #
#                                                                           #
# Copyright(C) 2019 Niklas Mohrin                                           #
#                                                                           #
# This program is free software: you can redistribute it and/or modify      #
# it under the terms of the GNU Affero General Public License as published  #
# by the Free Software Foundation, either version 3 of the License, or      #
# (at your option) any later version.                                       #
#                                                                           #
# This program is distributed in the hope that it will be useful,           #
# but WITHOUT ANY WARRANTY                                                  #
#ithout even the implied warranty of                                        #
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             #
# GNU Affero General Public License for more details.                       #
#                                                                           #
# You should have received a copy of the GNU Affero General Public License  #
# along with this program.  If not, see < https: // www.gnu.org/licenses/>. #
#############################################################################

# readDiagramPoints.py
# python3 script

import sys
from PIL import Image

if len(sys.argv) > 4:
	imgFileName = sys.argv[-4]
	voltageMax = float(sys.argv[-3])
	amperageMax = float(sys.argv[-2])
	outFilename = sys.argv[-1]
elif len(sys.argv) > 3:
	imgFileName = sys.argv[-3]
	voltageMax = float(sys.argv[-2])
	amperageMax = float(sys.argv[-1])
	outFilename = "pointData.json"
elif len(sys.argv) > 1:
	imgFileName = sys.argv[-1]
	voltageMax = 30
	amperageMax = 350
	outFilename = "pointData.json"
else:
	imgFileName = "diagram_raw.png"	
	voltageMax = 30
	amperageMax = 350
	outFilename = "pointData.json"

# lineColor = (19,21,22,255)
# lineColor = (255, 4, 0)
lineColor = (0,0,0,255)

print("Reading points with color {} from {}".format(lineColor, imgFileName))
print("Scaling: Maximum Voltage is {} and maximum Amperage is {}".format(voltageMax, amperageMax))
print("Data will be saved to {}".format(outFilename))
if input("Is that correct? ") != "y":
	print("Script shutting down")
	exit("Arguments: [inFilename, [maxVoltage, maxAmperage, [outFilename]]]")

img = Image.open(imgFileName)
data = img.getdata()

w,h = img.size

def getXY(index):
	x = index % w
	y = index // w
	return (x,y)

foundPoints = []

for i,t in enumerate(data):
	if t == lineColor:
		coords = getXY(i)
		foundPoints.append(coords)

def mapVal(x,xmin,xmax,ymin,ymax):
	return (((x - xmin) / (xmax - xmin)) * (ymax - ymin) + ymin)

foundCoords = [(0,0)] + list(sorted(filter(lambda t: t[0] > 0 ,map(lambda t: (mapVal(t[0],0,w,0, voltageMax), mapVal(t[1],0,h,amperageMax, 0)), foundPoints))))

print("Saving {} datapoints to {}".format(len(foundCoords), outFilename))

import json

materials = []
lines = []

with open(outFilename, "r+") as f:
	lines = f.readlines()
	firstLine = lines[0]
	materials = firstLine.split()[1:]
	secondLine = lines[1]
	assert secondLine == "const POINT_DATA = {};\n"

materialName = input("What material is this? ")
while not materialName.isalnum():
	materialName = input("What material is this? ")

if materialName in materials:
	raise Exception("This material is already in there somewhere. Fix your file.")

materials.insert(0, materialName)
obj = json.dumps(foundCoords)

lines[0] = "// " + " ".join(materials) + "\n"
lines.append("\nPOINT_DATA.{} = {};".format(materialName, obj))
lines.append("\nPOINT_DATA.{}.sort((a, b) => (a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0));".format(materialName))


with open(outFilename,"w") as f:
	f.writelines(lines)
	

