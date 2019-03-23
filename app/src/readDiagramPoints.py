# readDiagramPoints.py
# python3 script

import sys
from PIL import Image

print(sys.argv)

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

lineColor = (19,21,22,255)

print("Reading points with color {} from {}".format(lineColor, imgFileName))
print("Scaling: Maximum Voltage is {} and maximum Amperage is {}".format(voltageMax, amperageMax))
print("Data will be saved to {}".format(outFilename))
if input("Is that correct? ") != "y":
	print("Script shutting down")
	exit("Arguments: [filename, [maxVoltage, maxAmperage]]")

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

foundCoords = list(sorted(map(lambda t: (mapVal(t[0],0,w,voltageMax,0), mapVal(t[1],0,h,0,amperageMax)), foundPoints)))

print("Saving {} datapoints to {}".format(len(foundCoords), outFilename))

import json

with open(outFilename,"w") as f:
	json.dump(foundCoords, f)

