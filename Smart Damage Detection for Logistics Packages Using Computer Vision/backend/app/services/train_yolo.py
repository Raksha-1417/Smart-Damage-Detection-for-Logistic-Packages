# from roboflow import Roboflow

# rf = Roboflow(api_key="ZDuxjnrXu7EgjA73JXda")
# project = rf.workspace("smart-damage-detection-for-logistics-packages-using-computer-vision").project("damage-detection-for-packages-dspra")
# version = project.version(1)
# dataset = version.download("yolov8")


from roboflow import Roboflow
rf = Roboflow(api_key="ZDuxjnrXu7EgjA73JXda")
project = rf.workspace("smart-damage-detection-for-logistics-packages-using-computer-vision").project("damage-detection-for-packages-dspra")
version = project.version(6)
dataset = version.download("yolov8")
                