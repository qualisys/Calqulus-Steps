# Segment and joint names
## Skeleton description
Two skeletons definitions, m1 and m2, are supported in Calqulus. The first skeleton definition (m1) is used in our QTM workflows that are using the Sports marker set, Theia3D and Prisma Pose 1.0.0, Qualisys markerless engine. The table below provides a description of this skeleton definition.
![skeleton names](images/skeleton-m1.png)  

| Number          | Segment                               | Proximal Joint                                             | Distal Joint |
| :-----------    | :---------                            | :------------                                              | :------------  | 
| 1               | Hips                                  | Null                                                       | Null |
| 2               | Spine                                 | HipsSpine                                                  | SpineSpine1 |
| 3               | Spine1                                | SpineSpine1                                                | SpineSpine2 |
| 4               | Spine2                                | Spine1Spine2                                               | Spine2Neck |
| 5               | Neck                                  | Spine2Neck                                                 | NeckHead |
| 6               | Head                                  | NeckHead                                                   | HeadContact* |
| 7<br>12         | LeftShoulder<br>RightShoulder         | LeftSternoclavicular<br>RightSternoclavicular              | LeftGlenohumeral<br>RightGlenohumeral |
| 8<br>13         | LeftArm<br>RightArm                   | LeftGlenohumeral<br>RightGlenohumeral                      | LeftElbow<br>RightElbow |
| 9<br>14         | LeftForeArm<br>RightForeArm           | LeftElbow<br>RightElbow                                    | LeftForeArmLeftForeArmRoll<br>RightForeArmRightForeArmRoll |
| 10<br>15        | LeftForeArmRoll<br>RightForeArmRoll   | LeftForeArmLeftForeArmRoll<br>RightForeArmRightForeArmRoll | LeftWrist<br>RightWrist |
| 11<br>16        | LeftHand<br>RightHand                 | LeftWrist<br>RightWrist                                    | LeftHandContact*<br>RightHandContact* |
| 17<br>21        | LeftUpLeg<br>RightUpLeg               | LeftHip<br>RightHip                                        | LeftHip<br>RightHip |
| 18<br>22        | LeftLeg<br>RightLeg                   | LeftKnee<br>RightKnee                                      | LeftKnee<br>RightKnee |
| 19<br>23        | LeftFoot**<br>RightFoot**             | LeftAnkle<br>RightAnkle                                    | LeftFootContact*<br>RightFootContact* |
| 20<br>24        | LeftToeBase**<br>RightToeBase**       | Null                                                       | Null |

The second skeleton definition (m2) is used in our workflows using Prisma Pose 2.1.0 or later. The table below provides a description of this skeleton definition.  
![skeleton names](images/skeleton-m2.png) 
| Number          | Segment                               | Proximal Joint                                             | Distal Joint |
| :-----------    | :---------                            | :------------                                              | :------------  | 
| 1               | Pelvis                                | Null                                                       | Null |
| 2               | Thorax                                | PelvisThorax                                               | ThoraxCranium |
| 3               | Cranium                               | NeckCranium                                                | CraniumContact* |
| 4<br>8          | LeftClavicle<br>RightClavicle         | LeftSternoclavicular<br>RightSternoclavicular              | LeftGlenohumeral<br>RightGlenohumeral |
| 5<br>9          | LeftHumerus<br>RightHumerus           | LeftGlenohumeral<br>RightGlenohumeral                      | LeftElbow<br>RightElbow |
| 6<br>10         | LeftForearm<br>RightForearm           | LeftElbow<br>RightElbow                                    | LeftWrist<br>RightWrist |
| 7<br>11         | LeftMetacarpus<br>RightMetacarpus     | LeftWrist<br>RightWrist                                    | LeftMetacarpusContact*<br>RightMetacarpusContact* |
| 12<br>19        | LeftFemur<br>RightFemur               | LeftHip<br>RightHip                                        | LeftHip<br>RightHip |
| 13<br>20        | LeftShank<br>RightShank               | LeftKnee<br>RightKnee                                      | LeftKnee<br>RightKnee |
| 14<br>21        | LeftFoot**<br>RightFoot**             | LeftAnkle<br>RightAnkle                                    | LeftFootContact*<br>RightFootContact* |
| 15<br>22        | LeftHindfoot**<br>RightHindfoot**     | Null                                                       | Null |
| 16<br>23        | LeftMidfoot**<br>RightMidfoot**       | Null                                                       | Null |
| 17<br>24        | LeftForefoot**<br>RightForefoot**     | Null                                                       | Null |
| 18<br>25        | LeftHallux**<br>RightHallux**         | Null                                                       | Null |

\* These are virtual joints where the external forces and moments will be applied to one or more segment extremities. It is used during the inverse dynamics procedure. For example in gait, this Contact joint is the center of pressure where the foot is in contact with the force plate. It is useful if one wants to access the force plate data such as center of pressure, force and free moment.  
\** Please note that:
- LeftToeBase/RightToeBase have no degree-of-freedom and only a visual purpose with no biomechanical meaning.   
- LeftHindfoot/RightHindfoot, LeftMidfoot/RightMidfoot, LeftForefoot/RightForefoot and LeftHallux/RightHallux are kinematic-only segments. 
